var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'remotemysql.com',
  user: 'p5IjIhnhwq',
  password: 'rZWMwhVbjD',
  database: 'p5IjIhnhwq'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
});

module.exports = {
	getResult: function(sql, params, callback){
			if(params == null)
			{
				connection.query(sql, function (error, result) {
					if(error)
					{
						console.log(error.stack);
						callback([]);
					}
					else
					{
						callback(result);
					}
				});
			}
			else
			{
				connection.query(sql, params, function (error, result) {
					if(error)
					{
						console.log(error.stack);
						callback([]);
					}
					else
					{
						callback(result);
					}
				});
			}
	},

	execute: function(sql, params, callback){
		if(params == null)
		{
			connection.query(sql, function (error, result) {
				if(error)
				{
					console.log(error.stack);
					callback(false);
				}
				else
				{
					callback(true);
				}
			});
		}
		else
		{
			connection.query(sql, params, function (error, result) {
				if(error)
				{
					console.log(error.stack);
					callback(false);
				}
				else
				{
					callback(true);
				}
			});
		}
	},
	executeGetId: function(sql, params, callback){
		if(params == null)
		{
			connection.query(sql, function (error, result) {
				if(error)
				{
					console.log(error.stack);
					callback(-1);
				}
				else
				{
					callback(result.insertId);
				}
			});
		}
		else
		{
			connection.query(sql, params, function (error, result) {
				if(error)
				{
					console.log(error.stack);
					callback(-1);
				}
				else
				{
					callback(result.insertId);
				}
			});
		}
	}
};