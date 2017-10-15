/**
 * Created by iamhosseindhv on 08/09/2017.
 */
var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', isAuthenticated, function(req, res) {
    res.redirect('/dashboard/rooms');
});

router.get('/:tab', isAuthenticated, function(req, res) {
    const activeTab = req.params.tab;
    const user = req.user;

    var properties = {};
    properties.activeTab = activeTab;
    properties.user = user;
    properties.isAuthenticated = true;

    switch (activeTab){
        case 'rooms':
            handleRooms(properties, function (modifiedProperties) {
                res.render('dashboard/rooms', modifiedProperties);
            });
            break;
        case 'profile':
            res.render('dashboard/profile', properties);
            break;
    }
    
});









function handleRooms(properties, callback) {
    const db = require('../database');
    properties.title = 'Rooms';
    db.query('SELECT * FROM listing WHERE user_id = ?', [properties.user.id], function (err, results) {
        if (err) throw err;
        properties.my_listings = results;
        properties.my_listings_count = results.length;
        callback(properties);
    });
}


function isAuthenticated(req, res, next) {
    console.log(req.isAuthenticated);

    if (req.isAuthenticated === undefined){
        throw 'STATUS IS UNDEFINED'
    }

    if (req.isAuthenticated === true){
        next();
    } else {
        res.redirect('/authenticate');
    }
}




module.exports = router;