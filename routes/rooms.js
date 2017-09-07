/**
 * Created by iamhosseindhv on 21/06/2017.
 */
var express = require('express');
var mysql = require('mysql');
var router = express.Router();




/* GET home page. */
router.get('/:id', function(req, res, next) {
     //'id' is the listing id
     //find listing and render related page
     findListing(res, req.params.id, renderPage);
});

router.get('/:id', function(req, res, next) {
     //should render page where user can see his listings (if he's host) - see airbnb.co.uk/rooms
});



var findListing = function (response, id, callback) {
     var connection = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "107109DehnavI",
          database : 'Test'
     });
     connection.connect();
     var sql = 'SELECT * FROM listing WHERE id = ' + connection.escape(id);
     connection.query(sql, function (error, results) {
          if (error) throw error;
          // console.log(results[0]);
          var listing = results[0];
          callback(response, listing);
     });
     connection.end();
}


var renderPage = function (response, listing) {
     response.render('rooms', {
          title: 'Rooms',
          listing: listing
     });
}


module.exports = router;

