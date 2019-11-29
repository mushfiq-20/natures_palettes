var db = require('./db');

module.exports = {
	insert: function(file, callback){
		var sql = "INSERT INTO files VALUES (null, ?, ?, ?)";
		var type='File';

		db.execute(sql, [file.file_name, file.description, file.path], function(flag){
			callback(flag);
		});
	},
	insertAll: function(file, callback){
		var sql = "INSERT INTO submission VALUES (null, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		var type='File';

		db.execute(sql, [file.f_name, file.l_name, file.email, file.institution, file.data_type, file.data_from, file.published, file.reference, file.doi, file.embargo_date, file.metadata, file.rawdata, file.metadata_values ], function(flag){
			callback(flag);
		});
	},
	getLastId: function(callback){
		var sql = "SELECT id FROM submission ORDER BY id DESC LIMIT 1";
		db.getResult(sql, null, function(result){
		
			callback(result);
			
		});
	},
	getById: function(id,callback){
		var sql = "SELECT * FROM submission WHERE id=?";
		db.getResult(sql, [id], function(result){
		
			callback(result);
			
		});
	},
	update: function(met,id,callback){
		var sql = "UPDATE submission SET metadata_values=? WHERE id=?";
		db.execute(sql, [met, id], function(result){
		
			callback(result);
			
		});
	},
	getAll: function(callback){
		var sql = "SELECT * FROM submission";
		db.getResult(sql, null, function(result){
		
			callback(result);
			
		});
	}
};