/**
 * Created by iamhosseindhv on 27/09/2017.
 */
var express = require('express');
var router = express.Router();

/* GET edit page. */
router.get('/new-listing', isAuthenticated, function (req, res, next) {
    res.render('newListing', {
        title: 'New Listing'
    });
});


router.post('/new-listing', isAuthenticated, function (req, res, next) {
    //validate inputs
    const errors = validateInputs(req);
    if (errors){
        const response = {
            success: false,
            message: errors,
            isValidInputs: false
        };
        res.json(response);
    } else {
        const type = req.body.house_type;
        const max_guest = req.body.max_guest;
        const bedroom_count = req.body.bedroom_count;
        const bed_count = req.body.bed_count;
        const bathroom_count = req.body.bathroom_count;
        const location = req.body.location;
        const full_address = req.body.full_address;
        const longitude = req.body.longitude;
        const latitude = req.body.latitude;
        const title = req.body.title;
        const price = req.body.price;
        const user_id = req.user.id;
        const creation_date = getTodayDate();

        const db = require('../database');
        const statement = 'INSERT INTO listing ' +
            '(location, price, title, type, bed_count, bedroom_count, bathroom_count, max_guest, longitude, latitude, user_id, creation_date, full_address) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?)';
        db.query(statement, [location, price, title, type, bed_count, bedroom_count, bathroom_count, max_guest, longitude, latitude, user_id, creation_date, full_address], function (err) {
            if (err) {
                throw err;
            } else {
                const response = {
                    success: true,
                    message: null,
                    isValidInputs: true
                };
                res.send(response);
            }
        });
    }
});


router.post('/add-listing-to-favourite', function (req, res, next) {
    if (req.isAuthenticated !== true){
        res.json({
            presentLogin: true,
            favourited: false
        });
    } else {
        //TODO: validate listingID
        const listing_id = req.body.listingid;
        const user_id = req.user.id;
        const db = require('../database');
        db.query('INSERT INTO favourited (user_id, listing_id) VALUES (?, ?)', [user_id, listing_id], function (err) {
            if (err) {
                if (err.code = 'ER_DUP_ENTRY') {
                    res.json({
                        presentLogin: false,
                        favourited: false,
                        message: 'Listing already added to favourite list'
                    });
                }
            }
            else {
                res.json({
                    presentLogin: false,
                    favourited: true
                });
            }
        });
    }
});



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

function getTodayDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + '-' + month + '-' + day;
}


function validateInputs(req) {
    req.checkBody('house_type', 'Invalid \'House Type\'').isIn(['Entire House', 'Private Room', 'Shared Room']);
    req.checkBody('max_guest', 'You should enter \'Number of Guests\' ').notEmpty();
    req.checkBody('bedroom_count', 'You should enter \'Number of Bedrooms\' ').notEmpty();
    req.checkBody('bed_count', 'You should enter \'Number of Beds\' ').notEmpty();
    req.checkBody('bathroom_count', 'You should enter \'Number of Bathrooms\' ').notEmpty();
    req.checkBody('location', 'You should enter \'Location\' ').notEmpty();
    req.checkBody('full_address', 'You should enter \'Full Address\' ').notEmpty();
    req.checkBody('title', 'You should enter \'Title\' ').notEmpty();
    req.checkBody('price', 'You should enter \'Price\' ').notEmpty();
    req.checkBody('longitude', 'You should enter \'Longitude\' ').notEmpty();
    req.checkBody('latitude', 'You should enter \'Latitude\' ').notEmpty();
    req.checkBody('location', '\'Location\' must be 2-60 character').len(1, 60);
    req.checkBody('title', '\'Title\' must be 5-60 character').len(5, 60);
    req.checkBody('full_address', '\'Full Address\' must be 5-150 character').len(5, 150);
    // req.checkBody('max_guest', '\'Number of Guests\' must be a number').isNumber();
    // req.checkBody('bedroom_count', '\'Number of Bedrooms\' must be a number').isNumber();
    // req.checkBody('bed_count', '\'Number of Beds\' must be a number').isNumber();
    // req.checkBody('bathroom_count', '\'Number of Bathrooms\' must be a number').isNumber();
    // req.checkBody('price', '\'Price\' must be a number').isNumber();

    const err = req.validationErrors();
    var errors = {};
    if (err){
        errors = {
            propery_details: [],
            location: [],
            booking_details: []
        };
        for (var i=0 ; i<err.length ; i++){
            const param = err[i].param;
            if (param === 'house_type' || param === 'max_guest' || param === 'bedroom_count' || param === 'bed_count' || param === 'bathroom_count'){
                errors.propery_details.push({ description: err[i].msg });
            }
            if (param === 'location' || param === 'full_address' || param === 'longitude' || param === 'latitude') {
                errors.location.push({ description: err[i].msg });
            }
            if (param === 'title' || param === 'price') {
                errors.booking_details.push({ description: err[i].msg });
            }
        }
    } else {
        errors = false; //no errors, all inputs are valid
    }
    return errors;
}




module.exports = router;