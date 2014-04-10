var program = require('commander');
var config = require('./config.json');

var aws = require('aws-sdk');
aws.config.update({
	accessKeyId: config.aws.key,
	secretAccessKey: config.aws.secret,
	region: config.aws.region
});

var ddb = new aws.DynamoDB();

var iKnowTheHeaders = false;

program.version('0.0.1')
.option('-s, --source [tablename]', 'Add the source (DynamoDB) table')
.option('-d, --destination [tablename]', 'Add the destination (MySQL) table')
.parse(process.argv);

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

var transfer = function (items) {
	for (index in items) {
		var data = {};
		for (var propertyName in items[index]) {
			var value = (items[index][propertyName].N) ? items[index][propertyName].N : String(items[index][propertyName].S);
			data[propertyName.replace(' ', '')] = value.replace(/\'/g, "'\\''");
		}
		var statement = connection.query('INSERT INTO ' + program.destination + ' SET ?', data, function (err, result) {
			if (err)
				throw err;
		});
		console.log(statement.sql);
	};
};

var scan = function (query) {
	ddb.scan(query, function (err, data) {
		if (err)
			console.dir(err);
		else {
			transfer(data.Items);
			if (data.LastEvaluatedKey) {
				query.ExclusiveStartKey = data.LastEvaluatedKey;
				scan(query);
			} else
				connection.end();
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
	if (err !== null) {
		throw err;
	}
	if (data == null) {
		throw 'Table ' + program.source + ' not found in DynamoDB';
	}
	query.Limit = config.aws.limit ? config.aws.limit : data.Table.ProvisionedThroughput.ReadCapacityUnits;
	scan(query);
});