/**
 * Created by iamhosseindhv on 08/09/2017.
 */
var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
    if (req.isAuthenticated){
        next();
    } else {
        res.redirect('/authenticate');
    }
});


router.get('/:tab', function(req, res) {
    const activeTab = query.params.tab;
    // const user = req.user;

    properties = {};
    properties.title = 'Dashboard';
    properties.activeTab = activeTab;
    // properties.user = user;

    res.render('dashboard', properties);
});








module.exports = router;