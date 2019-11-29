var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser')
var JSZip = require("jszip");
var fs = require('fs');
var mv = require('mv');
var glob = require("glob")
var extract = require('extract-zip');
var fs_extra = require('fs-extra');

router.get('/', function(req, res){
	uploadModel.getAll(function(rows){
		res.render('submissions', {subs: rows});
	});
});

router.get('/:id', function(req, res){
  req.params.id;

  uploadModel.getById(req.params.id, function(rows){
		res.render('modify', {rows: rows});
	});
  
  
});


router.post('/:id', function(req, res){
	uploadModel.getById(req.params.id, function(rows){

		if(req.body.old_rawdata_empty!='' && req.body.new_rawdata_empty=='' && req.body.metadata_empty=='' )
		{
			uploadedRawdataFile=req.files.old_rawdata;
			
			uploadedRawdataFile.mv('./public/modify/'+uploadedRawdataFile.name, function(err) {
				if (err){
				  req.flash("info", "File upload failed!");
				}
				else{
					var rawFiles=[];
					fs.readFile('./public/modify/'+uploadedRawdataFile.name, function(err, data) {
					    if (err) throw err;
					    JSZip.loadAsync(data).then(function (zip) {
					      files = Object.keys(zip.files);
					      files.forEach(function(element) {
							  element=element.split("/");
							  element=element[1].split(".Master.Transmission");
							  if(element[0]!='')
							  	rawFiles.push(element[0]);
							});

					      fs.unlinkSync('./public/modify/'+uploadedRawdataFile.name);
					      
					      var met=JSON.parse(rows[0].metadata_values);


					      for (var i = 0; i < rawFiles.length; i++) {
					      	for (var j = 0; j < met.length; j++) {
						      	if(met[j].filename==rawFiles[i])
						      	{
							      	met.splice(j, 1)
							    }
							}
							if (fs.existsSync('./public/upload/rawdata/submission-'+ req.params.id +'-rd/'+rawFiles[i]+'.Master.Transmission')) {   
					      		fs.unlinkSync('./public/upload/rawdata/submission-'+ req.params.id +'-rd/'+rawFiles[i]+'.Master.Transmission');
					      		req.flash("success-info", rawFiles[i]+" deleted from submission id: "+req.params.id);
							}
							else{
								req.flash("info", rawFiles[i]+" doesn't exist in submission id: "+req.params.id);
							}
					      }

					      uploadModel.update(JSON.stringify(met), req.params.id, function(rows){
				  			res.redirect('/upload/validateUpload');
					      	});
					    });
					});
				}
			}); 
		}

		else if(req.body.old_rawdata_empty=='' && req.body.new_rawdata_empty!='' && req.body.metadata_empty!='' )
		{
			//console.log(rows[0].iddata_from);

			uploadedMetadataFile=req.files.metadata; // the uploaded file object
			uploadedRawdataFile=req.files.new_rawdata; // the uploaded file object

				uploadedMetadataFile.mv('./public/modify/'+uploadedMetadataFile.name, function(err) {
					if (err){
					  //return res.status(500).send(err);
					  req.flash("info", "File upload failed!");
					  //res.redirect('/');
					}
					else{
						//uploadRaw();
					  //req.flash("info", "File uploaded");
					  //insertToDb();   
					  uploadedRawdataFile.mv('./public/modify/'+uploadedRawdataFile.name, function(err) {
							if (err){
							  //return res.status(500).send(err);
							  req.flash("info", "File upload failed!");
							  //res.redirect('/');
							}
							else{
							  //req.flash("info", "File uploaded");
							  //insertToDb();  
							  var extract = require('extract-zip')
							  
							  folder="submission-"+(rows[0].id);
							  

							  var src=process.cwd()+'/public/modify/'+folder;
								extract('./public/modify/'+uploadedRawdataFile.name, {dir: src}, function (err) {
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
				fs.createReadStream('./public/modify/'+uploadedMetadataFile.name)
			  	.pipe(csv())
			  	.on('data', (data) => results.push(data))
			  	.on('end', () => {
				  	for(var k in results[0]) keys.push(k);
			  			if(keys.indexOf('FileName')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>FileName</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='field' && keys.indexOf('UniqueID')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>UniqueID</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='museum' && keys.indexOf('institutionCode')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>institutionCode</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='museum' && keys.indexOf('catalogueNumber')  < 0)
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

				  		if(keys.indexOf('FileName')  < 0  || (rows[0].data_from=='field' && keys.indexOf('UniqueID') < 0) 
				  			|| (rows[0].data_from=='museum' && keys.indexOf('institutionCode') < 0) 
				  			|| (rows[0].data_from=='museum' && keys.indexOf('catalogueNumber') <0 )
				  	 		|| keys.indexOf('genus')  < 0 || keys.indexOf('specificEpithet')  < 0 
				  	 		|| keys.indexOf('Patch')  < 0 || keys.indexOf('LightAngle1')  < 0 || 
				  	 		keys.indexOf('LightAngle2')  < 0 || keys.indexOf('ProbeAngle1')  < 0 
				  	 		|| keys.indexOf('ProbeAngle2')  < 0 || keys.indexOf('Replicate')  < 0)
				  			{
				  	 			req.flash("info", "The above mandatory fields for "+rows[0].data_from+" type metadata are missing. Make sure you have all of these fields in your metadata file. Remember that the fields are case sensitive.");
				  	 			//callback(null, rawFiles, results);
				  	 			//res.redirect('/upload/validateUpload');
				  	 			var filePath = './public/modify/'+uploadedMetadataFile.name;
				  	 			fs.unlinkSync(filePath); 
				  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
								fs.unlinkSync(filePath);

				  	 			res.redirect('/upload/validateUpload/true');
				  	 			
				  	 		}
				  	 	else
				  	 		callback(null, rawFiles, results);
				});
			}

			var rawFiles=[];
			function fileNames(callback) {
			  fs.readFile('./public/modify/'+uploadedRawdataFile.name, function(err, data) {
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
						if(results[i]['FileName']=='' || (rows[0].data_from=='field' && results[i]['UniqueID']=='') 
							|| (rows[0].data_from=='museum' && results[i]['institutionCode']=='') 
							|| (rows[0].data_from=='museum' && results[i]['catalogueNumber']=='') 
							|| results[i]['genus']=='' || results[i]['specificEpithet']==''
							|| results[i]['Patch']=='' || results[i]['LightAngle1']==''
							|| results[i]['LightAngle2']=='' || results[i]['ProbeAngle1']==''
							|| results[i]['ProbeAngle2']=='' || results[i]['Replicate']=='' )
						{
							req.flash("info", "There are empty values(s) in mandatory fields in row number: "+c);
							
							var filePath = './public/modify/'+uploadedMetadataFile.name;
			  	 			fs.unlinkSync(filePath); 
			  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
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
						var filePath = './public/modify/'+uploadedMetadataFile.name;
		  	 			fs.unlinkSync(filePath); 
		  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
						fs.unlinkSync(filePath);
						
						res.redirect('/upload/validateUpload/true');
						//console.log("One or more of the FileName(s) mentioned in metaData file is missing from RawData files.");
					}
					else{
						if(checker(rawFiles, fileNamesInMeta)!='true')
						{
							req.flash("info", "File ("+checker(rawFiles, fileNamesInMeta)+") mentioned in metadata but is missing from rawdata");
							
							var filePath = './public/modify/'+uploadedMetadataFile.name;
			  	 			fs.unlinkSync(filePath); 
			  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
							fs.unlinkSync(filePath);

							res.redirect('/upload/validateUpload/true');
						}

						else{
							//req.flash("info", "Metadata file is valid");

						
							//console.log(result.result);
								
							addFile(results);
							//res.redirect('/upload/validateUpload');
						}
					}
					
					//res.redirect('/upload/validateUpload');
				});
			});
			
			}

		  	function addFile(results) 
			{			
				var filePath = './public/modify/'+uploadedMetadataFile.name;
  	 			fs.unlinkSync(filePath); 
  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
				fs.unlinkSync(filePath);
				

				// path='./public/modify/submission-'+rows[0].id+'-rd';
				// src='./public/upload/rawdata/submission-'+rows[0].id+'-rd';
				// mv(path, src+'-rd', {mkdirp: true}, function(err) {
				//   // done. it first created all the necessary directories, and then
				//   // tried fs.rename, then falls back to using ncp to copy the dir
				//   // to dest and then rimraf to remove the source dir
				//   fs_extra.removeSync(src); 

				// });
				setTimeout(function(){ 

					fs_extra.copy('./public/modify/submission-'+rows[0].id+'-rd', './public/upload/rawdata/submission-'+rows[0].id+'-rd', function (err) {
					  if (err) return console.error(err)
					  fs_extra.removeSync('./public/modify/submission-'+rows[0].id+'-rd');
					  console.log('success!')
					});

				}, 3000);
				

				var json = JSON.stringify(results);
				var newJson = json.replace(/"([\w]+)":/g, function($0, $1) {
				  return ('"' + $1.toLowerCase() + '":');
				});

				var modified_met=JSON.parse(rows[0].metadata_values);

				var newObj = JSON.parse(newJson);

				modified_met=modified_met.concat(newObj);

				for (var i = 0; i < newObj.length; i++) {
					req.flash("success-info", newObj[i].filename+" added to submission id: "+rows[0].id);

				}

				var metadata_val=JSON.stringify(modified_met);
				console.log(modified_met);	
				

				uploadModel.update(metadata_val, rows[0].id, function(rows){
	  				res.redirect('/upload/validateUpload');
		      	});

			}
	
			//console.log('add: '+req.files.new_rawdata.name);
		}

		else if(req.body.old_rawdata_empty!='' && req.body.new_rawdata_empty!='' && req.body.metadata_empty!='' )
		{
			uploadedOldRawdataFile=req.files.old_rawdata;
			
			uploadedOldRawdataFile.mv('./public/modify/'+uploadedOldRawdataFile.name, function(err) {
				if (err){
				  req.flash("info", "File upload failed!");
				}
				else{
					var rawFiles=[];
					fs.readFile('./public/modify/'+uploadedOldRawdataFile.name, function(err, data) {
					    if (err) throw err;
					    JSZip.loadAsync(data).then(function (zip) {
					      files = Object.keys(zip.files);
					      files.forEach(function(element) {
							  element=element.split("/");
							  element=element[1].split(".Master.Transmission");
							  if(element[0]!='')
							  	rawFiles.push(element[0]);
							});

					      fs.unlinkSync('./public/modify/'+uploadedOldRawdataFile.name);
					      
					      var met=JSON.parse(rows[0].metadata_values);


					      for (var i = 0; i < rawFiles.length; i++) {
					      	for (var j = 0; j < met.length; j++) {
						      	if(met[j].filename==rawFiles[i])
						      	{
							      	met.splice(j, 1)
							    }
							}
							if (fs.existsSync('./public/upload/rawdata/submission-'+ req.params.id +'-rd/'+rawFiles[i]+'.Master.Transmission')) {   
					      		fs.unlinkSync('./public/upload/rawdata/submission-'+ req.params.id +'-rd/'+rawFiles[i]+'.Master.Transmission');
					      		req.flash("success-info", rawFiles[i]+" deleted from submission id: "+req.params.id);
							}
							else{
								fs.unlinkSync('./public/upload/rawdata/submission-'+ req.params.id +'-rd/'+rawFiles[i]+'.Master.Transmission');
								req.flash("info", rawFiles[i]+" doesn't exist in submission id: "+req.params.id);
							}
					      }

					      setTimeout(function(){
					      	fs_extra.removeSync('./public/modify/submission-'+ req.params.id +'-rd/')
					      },3000);
					      uploadModel.update(JSON.stringify(met), req.params.id, function(rows){
					      	});
					    });
					});
				}
			}); 

			//deleted

			//adding
				uploadedMetadataFile=req.files.metadata; // the uploaded file object
			uploadedRawdataFile=req.files.new_rawdata; // the uploaded file object

				uploadedMetadataFile.mv('./public/modify/'+uploadedMetadataFile.name, function(err) {
					if (err){
					  //return res.status(500).send(err);
					  req.flash("info", "File upload failed!");
					  //res.redirect('/');
					}
					else{
						//uploadRaw();
					  //req.flash("info", "File uploaded");
					  //insertToDb();   
					  uploadedRawdataFile.mv('./public/modify/'+uploadedRawdataFile.name, function(err) {
							if (err){
							  //return res.status(500).send(err);
							  req.flash("info", "File upload failed!");
							  //res.redirect('/');
							}
							else{
							  //req.flash("info", "File uploaded");
							  //insertToDb();  
							  var extract = require('extract-zip')
							  
							  folder="submission-"+(rows[0].id);
							  

							  var src=process.cwd()+'/public/modify/'+folder;
								extract('./public/modify/'+uploadedRawdataFile.name, {dir: src}, function (err) {
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
				fs.createReadStream('./public/modify/'+uploadedMetadataFile.name)
			  	.pipe(csv())
			  	.on('data', (data) => results.push(data))
			  	.on('end', () => {
				  	for(var k in results[0]) keys.push(k);
			  			if(keys.indexOf('FileName')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>FileName</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='field' && keys.indexOf('UniqueID')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>UniqueID</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='museum' && keys.indexOf('institutionCode')  < 0)
				  	 	{
				  	 		req.flash("list", "<span>institutionCode</span> is missing.");
				  	 	}
				  	 	if(rows[0].data_from=='museum' && keys.indexOf('catalogueNumber')  < 0)
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

				  		if(keys.indexOf('FileName')  < 0  || (rows[0].data_from=='field' && keys.indexOf('UniqueID') < 0) 
				  			|| (rows[0].data_from=='museum' && keys.indexOf('institutionCode') < 0) 
				  			|| (rows[0].data_from=='museum' && keys.indexOf('catalogueNumber') <0 )
				  	 		|| keys.indexOf('genus')  < 0 || keys.indexOf('specificEpithet')  < 0 
				  	 		|| keys.indexOf('Patch')  < 0 || keys.indexOf('LightAngle1')  < 0 || 
				  	 		keys.indexOf('LightAngle2')  < 0 || keys.indexOf('ProbeAngle1')  < 0 
				  	 		|| keys.indexOf('ProbeAngle2')  < 0 || keys.indexOf('Replicate')  < 0)
				  			{
				  	 			req.flash("info", "The above mandatory fields for "+rows[0].data_from+" type metadata are missing. Make sure you have all of these fields in your metadata file. Remember that the fields are case sensitive.");
				  	 			//callback(null, rawFiles, results);
				  	 			//res.redirect('/upload/validateUpload');
				  	 			var filePath = './public/modify/'+uploadedMetadataFile.name;
				  	 			fs.unlinkSync(filePath); 
				  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
								fs.unlinkSync(filePath);

				  	 			res.redirect('/upload/validateUpload/true');
				  	 			
				  	 		}
				  	 	else
				  	 		callback(null, rawFiles, results);
				});
			}

			var rawFiles=[];
			function fileNames(callback) {
			  fs.readFile('./public/modify/'+uploadedRawdataFile.name, function(err, data) {
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
						if(results[i]['FileName']=='' || (rows[0].data_from=='field' && results[i]['UniqueID']=='') 
							|| (rows[0].data_from=='museum' && results[i]['institutionCode']=='') 
							|| (rows[0].data_from=='museum' && results[i]['catalogueNumber']=='') 
							|| results[i]['genus']=='' || results[i]['specificEpithet']==''
							|| results[i]['Patch']=='' || results[i]['LightAngle1']==''
							|| results[i]['LightAngle2']=='' || results[i]['ProbeAngle1']==''
							|| results[i]['ProbeAngle2']=='' || results[i]['Replicate']=='' )
						{
							req.flash("info", "There are empty values(s) in mandatory fields in row number: "+c);
							
							var filePath = './public/modify/'+uploadedMetadataFile.name;
			  	 			fs.unlinkSync(filePath); 
			  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
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
						var filePath = './public/modify/'+uploadedMetadataFile.name;
		  	 			fs.unlinkSync(filePath); 
		  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
						fs.unlinkSync(filePath);
						
						res.redirect('/upload/validateUpload/true');
						//console.log("One or more of the FileName(s) mentioned in metaData file is missing from RawData files.");
					}
					else{
						if(checker(rawFiles, fileNamesInMeta)!='true')
						{
							req.flash("info", "File ("+checker(rawFiles, fileNamesInMeta)+") mentioned in metadata but is missing from rawdata");
							
							var filePath = './public/modify/'+uploadedMetadataFile.name;
			  	 			fs.unlinkSync(filePath); 
			  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
							fs.unlinkSync(filePath);

							res.redirect('/upload/validateUpload/true');
						}

						else{
							//req.flash("info", "Metadata file is valid");

						
							//console.log(result.result);
								
							addFile(results);
							//res.redirect('/upload/validateUpload');
						}
					}
					
					//res.redirect('/upload/validateUpload');
				});
			});
			
			}

		  	function addFile(results) 
			{			
				var filePath = './public/modify/'+uploadedMetadataFile.name;
  	 			fs.unlinkSync(filePath); 
  	 			filePath = './public/modify/'+uploadedRawdataFile.name; 
				fs.unlinkSync(filePath);

				// path='./public/modify/submission-'+rows[0].id+'-rd';
				// src='./public/upload/rawdata/submission-'+rows[0].id+'-rd';
				// mv(path, src+'-rd', {mkdirp: true}, function(err) {
				//   // done. it first created all the necessary directories, and then
				//   // tried fs.rename, then falls back to using ncp to copy the dir
				//   // to dest and then rimraf to remove the source dir
				//   fs_extra.removeSync(src); 

				// });

				setTimeout(function(){
					fs_extra.copy('./public/modify/submission-'+rows[0].id+'-rd', './public/upload/rawdata/submission-'+rows[0].id+'-rd', function (err) {
					  if (err) return console.error(err)
					  console.log('success!')
					  console.log(rows[0].id);
						fs_extra.removeSync('./public/modify/submission-'+rows[0].id+'-rd/')
					});
				},3000);

				uploadModel.getById(rows[0].id, function(rows_new){
					var json = JSON.stringify(results);
					var newJson = json.replace(/"([\w]+)":/g, function($0, $1) {
					  return ('"' + $1.toLowerCase() + '":');
					});

					var modified_met=JSON.parse(rows_new[0].metadata_values);

					var newObj = JSON.parse(newJson);

					modified_met=modified_met.concat(newObj);

					for (var i = 0; i < newObj.length; i++) {
						req.flash("success-info", newObj[i].filename+" added to submission id: "+rows[0].id);

					}

					var metadata_val=JSON.stringify(modified_met);
					console.log(modified_met);	
					

					uploadModel.update(metadata_val, rows_new[0].id, function(rows){
		  				res.redirect('/upload/validateUpload');
			      	});
				});

				

			}

			//added



			console.log('replace: '+req.files.old_rawdata.name+' with: '+req.files.new_rawdata.name);
		}
		else{
			//console.log('function not allowed');
			req.flash("Function not allowed");
			res.redirect('/upload/validateUpload');
		}
	});
});






module.exports = router;
