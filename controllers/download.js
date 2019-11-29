var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser');
var JSZip = require("jszip");
var fs = require('fs');
var mv = require('mv');
var jsonexport = require('jsonexport');
var archiver = require('archiver');
var download = require('download-file')



router.post('/', function(req, res){
	arr=JSON.parse(req.body.arr);
	subIds=JSON.parse(req.body.subIds);

  	var rand=Math.floor(Math.random() * 1000);
	var output = fs.createWriteStream('./public/download/'+rand+'.zip');
	var archive = archiver('zip', {
	    gzip: true,
	});

	archive.on('error', function(err) {
	  throw err;
	});

	// pipe archive data to the output file
	archive.pipe(output);
	for (var i = 0; i < arr.length; i++) {
		archive.file('./public/upload/rawdata/submission-'+subIds[i]+'-rd/'+arr[i].filename+'.Master.Transmission', {name: arr[i].filename+'.Master.Transmission'});
		}

	jsonexport(arr,rand,function(err, csv){
	    if(err) return console.log(err);

	    fs.writeFile('./public/download/'+rand+'.csv', csv, (err) => {
		    if (err) return console.log(err);

		    archive.file('./public/download/'+rand+'.csv', {name: 'metadata.csv'});
			archive.finalize();
		});
	});

	output.on('close', function() {
		fs.unlinkSync('./public/download/'+rand+'.csv');
		//res.download('./public/download/'+rand+'.zip');
		res.download('./public/download/'+rand+'.zip', function(err){
	  if(err) {
	    // Check if headers have been sent
	    if(res.headersSent) {
	    	fs.unlinkSync('./public/download/'+rand+'.zip');
	    } else {
	      return res.sendStatus(SOME_ERR); // 404, maybe 500 depending on err
	    }
	  }
	});
	
	  //console.log('archiver has been finalized and the output file descriptor has closed.');
	});
			
	
		
});

module.exports = router;
