DynamoDB2MYSQL
==============

Node.js script to transfer DynamoDB table to MySQL

All you need to do is create config.json file in that same directory as such:

	{
		"aws":
		{
			"key": "AWS_ACCESS_KEY",
			"secret": "AWS_SECRET_KEY",
			"region": "AWS_REGION",
			"limit": DYNAMODB_LIMIT_ROWS_PER_READ
		},
		"mysql":
		{
			"host": "MYSQL_HOST",
			"port": "MYSQL_PORT",
			"user": "MYSQL_USER",
			"password": "MYSQL_PASSWORD",
			"database": "MYSQL_DATABASE_NAME"
		}
	}

The output is executed sql.

Usage
-------------------

typically, to use you'd run:

	node dynamoDBtoCSV.js -t Hourly_ZEDO_Impressions_by_IP > output.csv

Full syntax is:

	node dynamodb2mysql [options]

	Options:
		-h, --help                     output usage information
		-V, --version                  output the version number
		-s, --source [tablename]       Add the source (DynamoDB) table
		-d, --destination [tablename]  Add the destination (MySQL) table

Pre-requisites
--------------

You'll need to install a few modules, including:
* aws-sdk
* commander
* mysql

npm install aws-sdk commander mysql

should do it.

Big thanks to [DynamoDBtoCSV](https://github.com/edasque/DynamoDBtoCSV) and [Dynamo-archive](https://github.com/yegor256/dynamo-archive) repositories for knowledge
