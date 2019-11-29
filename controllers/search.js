var express = require('express');
var router = express.Router();
var uploadModel = require.main.require('./models/upload-model');
var csv = require('csv-parser')
var JSZip = require("jszip");
var fs = require('fs');
var glob = require("glob")

router.get('/', function(req, res){
	res.render('search');
});

router.post('/', function(req, res){
	uploadModel.getAll(function(rows){
	  var arr=[]; 
	  //search
	var institutionCode_or = req.body.institutionCode.toUpperCase().toUpperCase().split(" OR "), institutionCode_not = req.body.institutionCode.toUpperCase().split("NOT ");
    var collectionCode_or = req.body.collectionCode.toUpperCase().split(" OR "), collectionCode_not = req.body.collectionCode.toUpperCase().split("NOT ");
    var catalogueNumber_or = req.body.catalogueNumber.toUpperCase().split(" OR "), catalogueNumber_not = req.body.catalogueNumber.toUpperCase().split("NOT ");
    var Class_or = req.body.Class.toUpperCase().split(" OR "), Class_not = req.body.Class.toUpperCase().split("NOT ");
    var Order_or = req.body.Order.toUpperCase().split(" OR "), Order_not = req.body.Order.toUpperCase().split("NOT ");
    var Family_or = req.body.Family.toUpperCase().split(" OR "), Family_not = req.body.Family.toUpperCase().split("NOT ");
    var genus_or = req.body.genus.toUpperCase().split(" OR "), genus_not = req.body.genus.toUpperCase().split("NOT ");
    var specificEpithet_or = req.body.specificEpithet.toUpperCase().split(" OR "), specificEpithet_not = req.body.specificEpithet.toUpperCase().split("NOT ");
    var infraspecificEpithet_or = req.body.infraspecificEpithet.toUpperCase().split(" OR "), infraspecificEpithet_not = req.body.infraspecificEpithet.toUpperCase().split("NOT ");
    var Sex_or = req.body.Sex.toUpperCase().split(" OR "), Sex_not = req.body.Sex.toUpperCase().split("NOT ");
    var lifeStage_or = req.body.lifeStage.toUpperCase().split(" OR "), lifeStage_not = req.body.lifeStage.toUpperCase().split("NOT ");
    var Country_or = req.body.Country.toUpperCase().split(" OR "), Country_not = req.body.Country.toUpperCase().split("NOT ");
    var Patch_or = req.body.Patch.toUpperCase().split(" OR "), Patch_not = req.body.Patch.toUpperCase().split("NOT ");
    
    var arr=[]; 
    var subIds=[];
    var removeRow = false;
    
    for (var i = 0; i < rows.length; i++) {
        row = JSON.parse(rows[i].metadata_values);
        for (var j = 0; j < row.length; j++) {
            if(
                ((req.body.institutionCode=='' || inArr(institutionCode_or,row[j].institutioncode.toUpperCase()) || institutionCode_not.length > 1)) 
                &&  ((req.body.collectionCode=='' || inArr(collectionCode_or,row[j].collectioncode.toUpperCase()) || collectionCode_not.length > 1)) 
                &&  ((req.body.catalogueNumber=='' || inArr(catalogueNumber_or,row[j].cataloguenumber.toUpperCase()) || catalogueNumber_not.length > 1)) 
                &&  ((req.body.Class=='' || inArr(Class_or,row[j].class.toUpperCase()) || Class_not.length > 1)) 
                &&  ((req.body.Order=='' || inArr(Order_or,row[j].order.toUpperCase()) || Order_not.length > 1)) 
                &&  ((req.body.Family=='' || inArr(Family_or,row[j].family.toUpperCase()) || Family_not.length > 1)) 
                &&  ((req.body.genus=='' || inArr(genus_or,row[j].genus.toUpperCase()) || genus_not.length > 1)) 
                &&  ((req.body.specificEpithet=='' || inArr(specificEpithet_or,row[j].specificepithet.toUpperCase()) || specificEpithet_not.length > 1)) 
                &&  ((req.body.infraspecificEpithet=='' || inArr(infraspecificEpithet_or,row[j].infraspecificepithet.toUpperCase()) || infraspecificEpithet_not.length > 1)) 
                &&  ((req.body.Sex=='' || inArr(Sex_or,row[j].sex.toUpperCase()) || Sex_not.length > 1)) 
                &&  ((req.body.lifeStage=='' || inArr(lifeStage_or,row[j].lifestage.toUpperCase()) || lifeStage_not.length > 1)) 
                &&  ((req.body.Country=='' || inArr(Country_or,row[j].country.toUpperCase()) || Country_not.length > 1)) 
                &&  ((req.body.Patch=='' || inArr(Patch_or,row[j].patch.toUpperCase()) || Patch_not.length > 1))
            ) {
                removeRow = checkForNot(institutionCode_not, collectionCode_not, catalogueNumber_not, Class_not, Order_not, Family_not, genus_not, specificEpithet_not, infraspecificEpithet_not, Sex_not, lifeStage_not, Country_not, Patch_not, row[j]);
                
                if(!removeRow) {
                	arr.push(row[j]);
                	subIds.push(rows[i].id);
                }
            }
            removeRow = false; 
        }
    }


      function inArr(arr, item){
            for(let i=0; i<arr.length; i++){
                // console.log("array item = " + arr[i] + ", item = " + item);
                if(item.trim() == arr[i].trim()){
                    // console.log('hi');
                    return true;
                }
            }
            return false;
      }


      function checkForNot(institutionCode_not, collectionCode_not, catalogueNumber_not, Class_not, Order_not, Family_not, genus_not, specificEpithet_not, infraspecificEpithet_not, Sex_not, lifeStage_not, Country_not, Patch_not, row)
        {
            let removeRow = false;
            if(institutionCode_not.length > 1){ if (inArr(institutionCode_not, row.institutioncode.toUpperCase())) return true; }
            if(collectionCode_not.length > 1){ if (inArr(collectionCode_not, row.collectioncode.toUpperCase())) return true; }
            if(catalogueNumber_not.length > 1){ if (inArr(catalogueNumber_not, row.cataloguenumber.toUpperCase())) return true; }
            if(Class_not.length > 1){ if (inArr(Class_not, row.class.toUpperCase())) return true; }
            if(Order_not.length > 1){ if (inArr(Order_not, row.order.toUpperCase())) return true; }
            if(Family_not.length > 1){ if (inArr(Family_not, row.family.toUpperCase())) return true; }
            if(genus_not.length > 1){ if (inArr(genus_not, row.genus.toUpperCase())) return true; }
            if(specificEpithet_not.length > 1){ if (inArr(specificEpithet_not, row.specificepithet.toUpperCase())) return true; }
            if(infraspecificEpithet_not.length > 1){ if (inArr (infraspecificEpithet_not, row.infraspecificepithet.toUpperCase())) return true; }
            if(Sex_not.length > 1){ if (inArr(Sex_not, row.sex.toUpperCase())) return true; }
            if(lifeStage_not.length > 1){ if (inArr(lifeStage_not, row.lifestage.toUpperCase())) return true; }
            if(Country_not.length > 1){ if (inArr(Country_not, row.country.toUpperCase())) return true; }
            if(Patch_not.length > 1){ if (inArr(Patch_not, row.patch.toUpperCase())) return true; }
            
            return false;
      }

	  //search end

	  res.render('search', {arr: arr, subIds: subIds, fields: req.body});
	});

	
});


module.exports = router;
