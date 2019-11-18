var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser')
var JSZip = require("jszip");
var fs = require('fs')


router.get('/', function(req, res){
	res.render('search');
});

router.post('/', function(req, res){
	uploadModel.getAll(function(rows){
	  var arr=[]; 
	  for (var i = 0; i < rows.length; i++) {
	  	row=JSON.parse(rows[i].metadata_values);
	  	for (var j = 0; j < row.length; j++) {
	  		console.log(row[j].cataloguenumber);
	  		if((req.body.institutionCode=='' || row[j].institutioncode==req.body.institutionCode) 
	  			&& (req.body.collectionCode=='' || row[j].collectioncode==req.body.collectionCode)
	  			&& (req.body.catalogueNumber=='' || row[j].cataloguenumber==req.body.catalogueNumber)
	  			&& (req.body.Class=='' || row[j].class==req.body.Class)
	  			&& (req.body.Order=='' || row[j].order==req.body.Order)
	  			&& (req.body.Family=='' || row[j].family==req.body.Family)
	  			&& (req.body.genus=='' || row[j].genus==req.body.genus)
	  			&& (req.body.specificEpithet=='' || row[j].specificepithet==req.body.specificEpithet)
	  			&& (req.body.infraspecificEpithet=='' || row[j].infraspecificepithet==req.body.infraspecificEpithet)
	  			&& (req.body.Sex=='' || row[j].sex==req.body.Sex)
	  			&& (req.body.lifeStage=='' || row[j].lifestage==req.body.lifeStage)
	  			&& (req.body.Country=='' || row[j].country==req.body.Country)
	  			&& (req.body.Patch=='' || row[j].patch==req.body.Patch)
	  			)
	  		{
	  			arr.push(row[j]);
	  		}
	  	}
	  }
	  
	  console.log(arr);

	  res.render('search', {arr: arr});
	});

	
});


module.exports = router;
