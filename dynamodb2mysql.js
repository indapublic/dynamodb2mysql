var program = require('commander');
var config = require('./config.json');

var aws = require('aws-sdk');
aws.config.update({
	accessKeyId: config.aws.key,
	secretAccessKey: config.aws.secret,
	region: config.aws.region
});

var ddb = new aws.DynamoDB();

program.version('0.0.1')
.option('-s, --source [tablename]', 'The source (DynamoDB) table')
.option('-d, --destination [tablename]', 'The destination (MySQL) table')
.option('--destroy', 'Destroy source (DynamoDB) table on transfer complete')
.option('--notify', 'Notify by Amazon SES on transfer complete')
.parse(process.argv);

process.on('exit', function() {
	sendNotify('DynamoDB2MYSQL Notification', 'Process exit');
});

if (!program.source || !program.destination) {
	console.log('You must specify a source and destination tables');
	program.outputHelp();
	process.exit(1);
};

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.database
});

var sendNotify = function (subject, message) {
	var params = {
		Source: config.notify.sender,
		Destination: {
			ToAddresses: [
				config.notify.recipient
			]
		},
		Message: {
			Subject: {
				Data: subject
			},
			Body: {
				Html: {
					Data: message
				}
			}
		}
	};
	var ses = new aws.SES();
	ses.sendEmail(params, function (err, data) {
		if (err) {
			console.dir(err);
			throw err;
		};
	});
};

var transfer = function (items) {
	for (index in items) {
		var data = {};
		for (var propertyName in items[index]) {
			var value = (items[index][propertyName].N) ? items[index][propertyName].N : String(items[index][propertyName].S);
			data[propertyName.replace(' ', '')] = value.replace(/\'/g, "'\\''");
		}
		var statement = connection.query('INSERT INTO ' + program.destination + ' SET ?', data, function (err, result) {
			if (err) {
				sendNotify('DynamoDB2MYSQL Notification', 'Transfer Exception');
				console.dir(err);
				throw err;
			}
		});
		console.log(statement.sql);
	};
};

var transferComplete = function () {
	connection.end();
	if (program.destroy)
		ddb.deleteTable({
			TableName: program.source
		}, function (err, data) {
			if (err) {
				sendNotify('DynamoDB2MYSQL Notification', 'deleteTable Exception');
				console.dir(err);
				throw err;
			} else
				if (program.notify)
					sendNotify('DynamoDB2MYSQL Notification', 'Transfer Complete');
		});
};

var scan = function (query) {
	ddb.scan(query, function (err, data) {
		if (err) {
			sendNotify('DynamoDB2MYSQL Notification', 'Scan Exception');
			console.dir(err);
			throw err;
		} else {
			transfer(data.Items);
			if (data.LastEvaluatedKey) {
				query.ExclusiveStartKey = data.LastEvaluatedKey;
				scan(query);
			} else
				transferComplete();
		};
	});
};

var query = {
	'TableName': program.source,
	'Limit': 1000
};

ddb.describeTable({
	TableName: program.source
}, function (err, data) {
	if (err) {
		sendNotify('DynamoDB2MYSQL Notification', 'describeTable Exception');
		console.dir(err);
		throw err;
	}
	if (data == null) {
		throw 'Table ' + program.source + ' not found in DynamoDB';
	}
	query.Limit = config.aws.limit ? config.aws.limit : data.Table.ProvisionedThroughput.ReadCapacityUnits;
	scan(query);
});