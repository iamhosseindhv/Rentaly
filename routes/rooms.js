/**
 * Created by iamhosseindhv on 21/06/2017.
 */
var express = require('express');
var mysql = require('mysql');
var router = express.Router();


/* GET home page. */


router.get('/:id', function(req, res, next) {
     //find listing and render related page
     var properties = {};
     properties.title = 'Rooms';

     findListing(req.params.id, properties, function (updatedProperties) {
          if (updatedProperties.listing){
               res.render('rooms', updatedProperties);
          } else {
               res.render('error-rooms');
          }
     });
});






var findListing = function (id, properties, callback) {
     const db = require('../database');
     const statement = 'SELECT * FROM listing WHERE id = ?';
     db.query(statement, [id], function (error, results) {
          if (error) throw error;
          //there exist NO listing with the given id
          if (!results[0]){
              properties.listing = null;
          } else {
              properties.listing = results[0];
          }
          callback(properties);
     });
};




module.exports = router;

