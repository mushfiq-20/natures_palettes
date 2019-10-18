var db = require('./db');

module.exports = {
	insert: function(file, callback){
		var sql = "INSERT INTO files VALUES (null, ?, ?, ?)";
		var type='File';

		db.execute(sql, [file.file_name, file.description, file.path], function(flag){
			callback(flag);
		});
	},
	getAll: function(callback){
		var sql = "SELECT * FROM files";
		db.getResult(sql, null, function(result){
		
			callback(result);
			
		});
	}
	// getById: function(id, callback){
	// 	var sql = "SELECT * from users join profiles on users.userId=profiles.userId where users.userId=?";
	// 	db.getResult(sql, [id], function(result){
		
	// 		callback(result);
			
	// 	});
	// },

	// delete: function(id, callback){
	// 	var sql = "DELETE from users where userId=?";
	// 	db.execute(sql, [id], function(flag){
		
	// 		callback(flag);
			
	// 	});
	// },
	// 
	// }
};