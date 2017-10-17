var express = require('express');
var request = require('request');
var queryString = require('query-string');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
     // if (Object.keys(req.query).length === 0) {
     //      res.redirect('..');
     // } else {
          renderSearchResultPage(res, req.query, null, req.isAuthenticated);
     // }
});



router.get('/:indicator', function(req, res, next) {
    const indicator = req.params.indicator;
    const noQuery = Object.keys(req.query).length === 0;
    const notCityName = (indicator === 'homes' || indicator === 'all' || indicator === 'places'|| indicator === 'experiences');
    if (notCityName){
        // if (noQuery) {
            //shows homepage but active tab in homepage is 'indicator' - e.g. airbnb.co.uk/s/homes
            // res.render('index', {
            //     title: 'HomePage',
            //     isAuthenticated: req.isAuthenticated,
            //     activeTab: indicator
            // });
        // }
        // else {
            renderSearchResultPage(res, req.query, null, req.isAuthenticated);
        // }
    }
    else {
        next();
    }
});



router.get('/:city', function(req, res) {
    const cityName = req.params.city;
    res.redirect('/s/' + cityName + '/homes');
});



router.get('/:city/homes', function(req, res, next) {
    const cityName = req.params.city;
    renderSearchResultPage(res, req.query, cityName, req.isAuthenticated);
});





function renderSearchResultPage(res, query, cityName, isAuthenticated) {
    if (cityName) {
        query.location = cityName;
    }
    const url = "http://localhost:3000/api/explore?" + queryString.stringify(query);
    request(url, function (error, response, body) {
        if (response.statusCode === 200){
            const results = JSON.parse(body);
            res.render('searchResult', {
                title: 'Search',
                location: results.location,
                listings: results.listings,
                listings_count: results.listings_count,
                isAuthenticated: isAuthenticated
        });
        } else {
            console.log(response.statusCode);
            console.log('error:', error);
        }
    });
}






module.exports = router;
