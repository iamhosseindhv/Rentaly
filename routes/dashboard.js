/**
 * Created by iamhosseindhv on 08/09/2017.
 */
var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
    if (req.isAuthenticated){
        res.redirect('/dashboard/rooms');
    } else {
        res.redirect('/authenticate');
    }
});

router.get('/:tab', function(req, res) {
    const activeTab = req.params.tab;
    // const user = req.user;

    properties = {};
    properties.title = 'Dashboard';
    properties.activeTab = activeTab;
    // properties.user = user;


    switch (activeTab){
        case 'rooms':
            res.render('dashboard/rooms', properties);
            break;
        case 'index':
            res.render('dashboard/index', properties);
            break;
    }


});








module.exports = router;