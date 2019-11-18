var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser')
var JSZip = require("jszip");
var fs = require('fs')


router.get('/', function(req, res){
	uploadModel.getAll(function(files){
      var data = {
      fileList: files
	  };
	 
	  res.render('upload',data);
	  });
});

// router.get('/download/:file', function(req, res){
//   var file = `./public/upload/`+ req.params.file;
//   res.download(file);
// });

router.get('/validateUpload', function(req, res){
	  res.render('validateUpload');
});

router.get('/validateUpload/:failed', function(req, res){

	var failed = req.params.failed;
   res.render("validateUpload", {failedVar: failed});
});




router.post('/', function(req, res) {
	// console.log(req.body.f_name);
	// console.log(req.body.l_name);
	// console.log(req.body.email);
	// console.log(req.body.institution);
	// console.log(req.body.data_type);
	// console.log(req.body.data_from);
	// console.log(req.body.published);
	// console.log(req.body.reference);
	// console.log(req.body.doi);
	// console.log(req.body.embargo);
	// console.log(req.files.metadata.name);
	// console.log(req.files.rawdata.name);
	
	//res.redirect('/upload');
	
	
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
					  validate(uploadedMetadataFile,uploadedRawdataFile);  	
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
					req.flash("info", "Metadata file is valid");
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
				req.flash("info", "File Uploaded and inserted into database!");
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


module.exports = router;
