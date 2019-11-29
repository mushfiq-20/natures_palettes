var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var fs = require('fs');



router.get('/', function(req, res){
	// uploadModel.getAll(function(files){
 //      var data = {
 //      fileList: files
	//   };

	//     res.render('index',data);
	//   });

	res.render('index');
});

router.get('/demo', function(req, res){
    var file = `./public/demo.zip`;
  	res.download(file, function(err){
	  if(err) {
	    // Check if headers have been sent
	    if(res.headersSent) {
	    } else {
	      return res.sendStatus(SOME_ERR); // 404, maybe 500 depending on err
	    }
	  }
	});
});

// router.get('/download/:file', function(req, res){
//   var file = `./public/upload/`+ req.params.file;
//   res.download(file);
// });




// router.post('/', function(req, res) {
// 	uploadedFile=req.files.file; // the uploaded file object
// 	uploadedFile.mv('./public/upload/'+uploadedFile.name, function(err) {
// 		if (err){
// 		  //return res.status(500).send(err);
// 		  req.flash("info", "File upload failed!");
// 		  res.redirect('/');
// 		}
// 		else{
// 		  //req.flash("info", "File uploaded");
// 		  insertToDb();    	
// 		}    
// 	});

//   	function insertToDb() 
// 	{						
// 		var file = {
// 			file_name: uploadedFile.name,
// 			description: req.body.description,
// 			path: uploadedFile.name
// 		};

// 		uploadModel.insert(file, function(valid){
// 			if(valid)
// 			{
// 				req.flash("info", "File Uploaded");
// 				res.redirect('/');
// 			}
// 			else
// 			{
// 				req.flash("info", "File Upload Failed!");
// 				res.redirect('/');
// 			}
			
// 		});
// 	}
// });


module.exports = router;
