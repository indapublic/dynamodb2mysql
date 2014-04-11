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

Pre-requisites
--------------

You'll need to install a few modules, including:
* aws-sdk
* commander
* mysql

Usage
-------------------

typically, to use you should run:

	node dynamodb2mysql.js -s dynamodb_table_name -d mysql_table_name > output.sql

Full options list is:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -s, --source [tablename]       The source (DynamoDB) table
    -d, --destination [tablename]  The destination (MySQL) table
    --destroy                      Destroy source (DynamoDB) table on transfer complete (optional)

Big thanks to [DynamoDBtoCSV](https://github.com/edasque/DynamoDBtoCSV) and [Dynamo-archive](https://github.com/yegor256/dynamo-archive) repositories for knowledge
