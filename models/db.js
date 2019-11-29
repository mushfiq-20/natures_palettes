var mysql = require('mysql');

var connection;

function handleDisconnect() {

	connection = mysql.createConnection({
	  host: 'remotemysql.com',
	  user: 'p5IjIhnhwq',
	  password: 'rZWMwhVbjD',
	  database: 'p5IjIhnhwq'
	});


	connection.connect(function(err) {
	  if (err) {
        connection.end();
	    console.error('error connecting: ' + err.stack);
	    setTimeout(handleDisconnect, 2000);
	    return;
	  }
	});

   connection.on('error', function(err) {
    //console.log('db error', err);
    //handleDisconnect();   
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log(err);                           // server variable configures this)
    }
  });
}

handleDisconnect();
// 

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