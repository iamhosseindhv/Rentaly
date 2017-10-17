var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // properties = {};
    // properties.title = 'Home';
    // properties.activeTab = 'all';
    // properties.isAuthenticated = req.isAuthenticated;
    // res.render('index', properties);
    res.redirect('/s');
});

module.exports = router;