var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser');
var JSZip = require("jszip");
var fs = require('fs');
var mv = require('mv');
var glob = require("glob")
var fs_extra = require('fs-extra');
var R = require("r-script");


router.get('/', function(req, res){
	uploadModel.getAll(function(files){
      var data = {
      fileList: files
	  };
	 
	  res.render('upload',data);
	  });
});

router.get('/template/:file', function(req, res){
  var file = `./public/template/`+ req.params.file;
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

router.get('/validateUpload', function(req, res){
	  res.render('validateUpload');
});

router.get('/validateUpload/:failed', function(req, res){

	var failed = req.params.failed;
   res.render("validateUpload", {failedVar: failed});
});




router.post('/', function(req, res) {
  uploadModel.getLastId(function(lastId){

	uploadedMetadataFile=req.files.metadata; // the uploaded file object
	uploadedRawdataFile=req.files.rawdata; // the uploaded file object

		uploadedMetadataFile.mv('./public/upload/metadata/'+uploadedMetadataFile.name, function(err) {
			if (err){
			  //return res.status(500).send(err);
			  req.flash("info", "File upload failed!");
			  //res.redirect('/');
			}
			else{
				//uploadRaw();
			  //req.flash("info", "File uploaded");
			  //insertToDb();   
			  uploadedRawdataFile.mv('./public/upload/rawdata/'+uploadedRawdataFile.name, function(err) {
					if (err){
					  //return res.status(500).send(err);
					  req.flash("info", "File upload failed!");
					  //res.redirect('/');
					}
					else{
					  //req.flash("info", "File uploaded");
					  //insertToDb();  
					  var extract = require('extract-zip')
					  if(lastId[0]==undefined)
					  {
					  	folder="submission-"+(parseInt(1));
					  }
					  else{
					  	folder="submission-"+(parseInt(lastId[0].id)+1);
					  }

					  var src=process.cwd()+'/public/upload/rawdata/'+folder;
						extract('./public/upload/rawdata/'+uploadedRawdataFile.name, {dir: src}, function (err) {
						 // extraction is complete. make sure to handle the err
						 if(err)
						 {
						 	console.log(err);
						 }

						var getDirectories = function (src, callback) {
						  glob(src + '/*/**', callback);
						};
						getDirectories(src, function (err, res) {
						  if (err) {
						    console.log('Error', err);
						  } else {

						    for (var i = 0; i < res.length; i++) {
						    	if(res[i].includes('Master.Transmission'))
							    {
							    	var b=res[i].lastIndexOf("/");
									var path= res[i].substring(0, b+1);
									//console.log(path);
									folder(path, src);
									break;
							    }
						    }
						    
						  }
						});

						function folder(path,src){
							mv(path, src+'-rd', {mkdirp: true}, function(err) {
							  // done. it first created all the necessary directories, and then
							  // tried fs.rename, then falls back to using ncp to copy the dir
							  // to dest and then rimraf to remove the source dir
							  fs_extra.removeSync(src); 

							});
						}
						
						 validate(uploadedMetadataFile,uploadedRawdataFile);  	
						})
					  //validate(uploadedMetadataFile,uploadedRawdataFile);  	
					}    
				}); 	
			}    
		});

		
	
	function validate(uploadedMetadataFile,uploadedRawdataFile){
		var results = [];
	var keys = [];

	function metaData(rawFiles,callback){
		fs.createReadStream('./public/upload/metadata/'+uploadedMetadataFile.name)
	  	.pipe(csv())
	  	.on('data', (data) => results.push(data))
	  	.on('end', () => {
		  	for(var k in results[0]) keys.push(k);
	  			if(keys.indexOf('FileName')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>FileName</span> is missing.");
		  	 	}
		  	 	if(req.body.data_from=='field' && keys.indexOf('UniqueID')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>UniqueID</span> is missing.");
		  	 	}
		  	 	if(req.body.data_from=='museum' && keys.indexOf('institutionCode')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>institutionCode</span> is missing.");
		  	 	}
		  	 	if(req.body.data_from=='museum' && keys.indexOf('catalogueNumber')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>catalogueNumber</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('genus')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>genus</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('Patch')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>Patch</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('LightAngle1')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>LightAngle1</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('LightAngle2')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>LightAngle2</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('ProbeAngle1')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>ProbeAngle1</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('ProbeAngle2')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>ProbeAngle2</span> is missing.");
		  	 	}
		  	 	if(keys.indexOf('Replicate')  < 0)
		  	 	{
		  	 		req.flash("list", "<span>Replicate</span> is missing.");
		  	 	}

		  		if(keys.indexOf('FileName')  < 0  || (req.body.data_from=='field' && keys.indexOf('UniqueID') < 0) 
		  			|| (req.body.data_from=='museum' && keys.indexOf('institutionCode') < 0) 
		  			|| (req.body.data_from=='museum' && keys.indexOf('catalogueNumber') <0 )
		  	 		|| keys.indexOf('genus')  < 0 || keys.indexOf('specificEpithet')  < 0 
		  	 		|| keys.indexOf('Patch')  < 0 || keys.indexOf('LightAngle1')  < 0 || 
		  	 		keys.indexOf('LightAngle2')  < 0 || keys.indexOf('ProbeAngle1')  < 0 
		  	 		|| keys.indexOf('ProbeAngle2')  < 0 || keys.indexOf('Replicate')  < 0)
		  			{
		  	 			req.flash("info", "The above mandatory fields for "+req.body.data_from+" type metadata are missing. Make sure you have all of these fields in your metadata file. Remember that the fields are case sensitive.");
		  	 			//callback(null, rawFiles, results);
		  	 			//res.redirect('/upload/validateUpload');
		  	 			var filePath = './public/upload/metadata/'+uploadedMetadataFile.name;
		  	 			fs.unlinkSync(filePath); 
		  	 			filePath = './public/upload/rawdata/'+uploadedRawdataFile.name; 
						fs.unlinkSync(filePath);

		  	 			res.redirect('/upload/validateUpload/true');
		  	 			
		  	 		}
		  	 	else
		  	 		callback(null, rawFiles, results);
		});
	}

	var rawFiles=[];
	function fileNames(callback) {
	  fs.readFile('./public/upload/rawdata/'+uploadedRawdataFile.name, function(err, data) {
		    if (err) throw err;
		    JSZip.loadAsync(data).then(function (zip) {
		      files = Object.keys(zip.files);
		      //console.log(files[0]);
		      files.forEach(function(element) {
				  element=element.split("/");
				  element=element[1].split(".Master.Transmission");
				  if(element[0]!='')
				  	rawFiles.push(element[0]);
				});
		      callback(null, rawFiles);
		    });
		});
	}

	fileNames(function(err, rawFiles)
	{
		metaData(rawFiles,function(err,rawFiles,results)
		{
			console.log("name");
			console.log(rawFiles);
			console.log("meta");
			fileNamesInMeta=[];
			var c=1;

			for (var i = 0; i < results.length; i++) {
				c++;
				if(results[i]['FileName']=='' || (req.body.data_from=='field' && results[i]['UniqueID']=='') 
					|| (req.body.data_from=='museum' && results[i]['institutionCode']=='') 
					|| (req.body.data_from=='museum' && results[i]['catalogueNumber']=='') 
					|| results[i]['genus']=='' || results[i]['specificEpithet']==''
					|| results[i]['Patch']=='' || results[i]['LightAngle1']==''
					|| results[i]['LightAngle2']=='' || results[i]['ProbeAngle1']==''
					|| results[i]['ProbeAngle2']=='' || results[i]['Replicate']=='' )
				{
					req.flash("info", "There are empty values(s) in mandatory fields in row number: "+c);
					
					var filePath = './public/upload/metadata/'+uploadedMetadataFile.name;
	  	 			fs.unlinkSync(filePath); 
	  	 			filePath = './public/upload/rawdata/'+uploadedRawdataFile.name; 
					fs.unlinkSync(filePath);

					res.redirect('/upload/validateUpload/true',);
					return;
					break;

				}
				else{
					fileNamesInMeta.push(results[i]['FileName']);
				}
			}
			console.log(fileNamesInMeta);
			function checker(arr, target){
				var ret=0;
				for (var i = 0; i < target.length; i++) {
					if(arr.includes(target[i]))
					{
						ret='true';
					}
					else{
						ret=target[i];
						console.log(target[i]);
						break; 
					}
				}

				return ret;
			}

			//var checker = (arr, target) => target.every(v => arr.includes(v));
			if(checker(fileNamesInMeta, rawFiles)!='true')
			{
				req.flash("info", "File ("+checker(fileNamesInMeta, rawFiles)+") from rawdata is not mentioned in the metadata file.");
				var filePath = './public/upload/metadata/'+uploadedMetadataFile.name;
  	 			fs.unlinkSync(filePath); 
  	 			filePath = './public/upload/rawdata/'+uploadedRawdataFile.name; 
				fs.unlinkSync(filePath);
				
				res.redirect('/upload/validateUpload/true');
				//console.log("One or more of the FileName(s) mentioned in metaData file is missing from RawData files.");
			}
			else{
				if(checker(rawFiles, fileNamesInMeta)!='true')
				{
					req.flash("info", "File ("+checker(rawFiles, fileNamesInMeta)+") mentioned in metadata but is missing from rawdata");
					
					var filePath = './public/upload/metadata/'+uploadedMetadataFile.name;
	  	 			fs.unlinkSync(filePath); 
	  	 			filePath = './public/upload/rawdata/'+uploadedRawdataFile.name; 
					fs.unlinkSync(filePath);

					res.redirect('/upload/validateUpload/true');
				}

				else{
					//req.flash("success-info", "Metadata file is valid");

				
					//console.log(result.result);
					src=process.cwd()+'/public/upload/rawdata/submission-10-rd';
					var out = R("Script.R")
					  .data(src)
					  .callSync();
					  
					console.log(out);
						
					insertToDb(results);
					//res.redirect('/upload/validateUpload');
				}
			}
			
			//res.redirect('/upload/validateUpload');
		});
	});
	
	}

  	function insertToDb(results) 
	{			
	  if(lastId[0]==undefined)
	  {
	  	folder="submission-"+(parseInt(1));
	  }
	  else{
	  	folder="submission-"+(parseInt(lastId[0].id)+1);
	  }

	var src=process.cwd()+'/public/upload/rawdata/'+folder+'-rd';
	var out = R("Script.R")
	  .data(src)
	  .callSync();
	if(out > -0.02)
	{
		var nodemailer = require('nodemailer');

		var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'naturespalette007@gmail.com',
		    pass: 'qwertyp01'
		  }
		});

		var mailOptions = {
		  from: 'naturespalette0070@gmail.com',
		  to: req.body.email,
		  subject: "Nature's Palette submission info",
		  html: "<h1>Nature's Palette</h1><p>Your rawdata files are valid.</p><hp>MIN Spectra value of your files is: "+out+" </p>"
		};

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});
	}
	else
	{
		var nodemailer = require('nodemailer');

		var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'naturespalette007@gmail.com',
		    pass: 'qwertyp01'
		  }
		});

		var mailOptions = {
		  from: 'naturespalette0070@gmail.com',
		  to: req.body.email,
		  subject: "Nature's Palette submission info",
		  html: "<h1>Nature's Palette</h1><p>Your rawdata files are not valid.</p><hp>MIN Spectra value of your files is: "+out+" </p>"
		};

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});
	}


	var json = JSON.stringify(results);
	var newJson = json.replace(/"([\w]+)":/g, function($0, $1) {
	  return ('"' + $1.toLowerCase() + '":');
	});
	var newObj = JSON.parse(newJson);
	console.debug(newObj);

	var metadata_val=JSON.stringify(newObj);	

		var file = {
			f_name: req.body.f_name,
			l_name: req.body.l_name,
			email: req.body.email,
			institution: req.body.institution,
			data_type: req.body.data_type,
			data_from: req.body.data_from,
			published: req.body.published,
			reference: req.body.reference,
			doi: req.body.doi,
			embargo_date: req.body.date,
			metadata: req.files.metadata.name,
			rawdata: req.files.rawdata.name,
			metadata_values: metadata_val
		};

		uploadModel.insertAll(file, function(valid){
			if(valid)
			{
				req.flash("success-info", "Submission has passed 1st check !!");
				req.flash("success-info", "You will be advised if we find any corrupted files via email.");
				res.redirect('/upload/validateUpload')
			}
			else
			{
				req.flash("info", "File Upload Failed!");
				res.redirect('/upload/validateUpload')
			}
			
		});
	}

 });	
});


module.exports = router;
