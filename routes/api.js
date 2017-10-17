/**
 * Created by iamhosseindhv on 19/07/2017.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var mysql = require('mysql');
var jalali = require('jalaali-js');


/* GET resuls for api call. */
router.get('/explore', function(req, res, next) {
    const query = req.query;

    if (query.search_by_map === 'true'){
        console.log('should search by map coordinates');
        queryByMapCoordinates(query.ne_lat, query.ne_lng, query.sw_lat, query.sw_lng, query)
            .then(function (results) {
                var response = {};
                response.listings = results.listings;
                response.listings_count = results.listings_count;
                response.location = null;
                res.send(response);
            })
        
    }
    else {
        if (query.location){
            console.log('should search by cityName');
            getCityLocation(query)
                .then(makeNewQuery)
                .then(function (results) {
                    var response = {};
                    response.listings = results.listings;
                    response.listings_count = results.listings_count;
                    response.location = query.location.split('-').join(', ');
                    res.send(response);
                })
        }
        else {
            console.log('neither by city or search by map');
            makeNewQuery(query)
                .then(function (results) {
                    var response = {};
                    response.listings = results.listings;
                    response.listings_count = results.listings_count;
                    response.location = null;
                    res.send(response);
                });
        }
    }



});


function getCityLocation(query) {
    return new Promise(function(resolve, reject) {
        console.log('location is:'+ query.location);
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
            + query.location + '&language=fa&key=AIzaSyDYmqhY-KcOz1kHrx6JlKK7QgsloTZNRp8';
        request(url, function (error, response, body) {
            if (response.statusCode === 200){
                const res = JSON.parse(body);
                query.coordinates = res.results[0].geometry.location;
                resolve(query);
            } else {
                console.log(response.statusCode);
                console.log('error:', error);
                reject(error);
            }
        });
    });
}


//this function should return query results
function makeNewQuery(query) {
    return new Promise(function(resolve, reject) {
        var db = require('../database');

        //search with city coordinates
        const statement = getSqlStatement(query);
        var sqlAll = "SELECT * FROM listing ";
        var sqlCount = "SELECT COUNT(*) AS 'count' FROM listing ";
        if (statement.countStatement !== ""){
            sqlAll += "WHERE ";
            sqlCount += "WHERE ";
        }
        sqlAll += statement.listingStatement + ";";
        sqlCount += statement.countStatement + ";";
        // console.log(sqlAll);
        const final = {};
        db.query(sqlCount, function (error, result) {
            if (error) reject('some err getting total count');
            final.listings_count = result[0].count;
        });
        db.query(sqlAll, function (error, listings) {
            if (error) reject('some err getting listings');
            final.listings = listings;
            resolve(final);
        });

    });
}



function queryByMapCoordinates(ne_lat, ne_lng, sw_lat, sw_lng, query) {
    return new Promise(function(resolve, reject) {
        var db = require('../database');
        var countStatement = "WHERE latitude BETWEEN " + sw_lat + " AND " + ne_lat + " AND longitude BETWEEN " + sw_lng + " AND " + ne_lng;
        // #1
        if (query.guests) {
            countStatement += " AND max_guest <= " + query.guests;
        }
        // #2
        if (query.from && query.to) {
            const from = query.from;
            const to = query.to;
            countStatement += "AND id NOT IN (SELECT listing_id FROM Reservations" +
                " WHERE '" + to + "' BETWEEN checkin AND checkout" +
                " OR checkout BETWEEN '" + from + "' AND '" + to + "'" +
                " OR '" + from + "' BETWEEN checkin AND checkout" +
                " OR checkin BETWEEN '" + from + "' AND '" + to + "')";
        }
        // #3
        var limit = "";
        if (query.offset) {
            var offset = (query.offset - 1) * 18;
            limit = " LIMIT " + offset + ",18";
        } else {
            limit = " LIMIT 18";
        }

        const listingStatement = countStatement + limit;
        var sqlAll = "SELECT * FROM listing " + listingStatement + ";";
        var sqlCount = "SELECT COUNT(*) AS 'count' FROM listing " + countStatement + ";";
        const final = {};
        db.query(sqlCount, function (error, result) {
            if (error) reject('some err getting total count');
            final.listings_count = result[0].count;
        });
        db.query(sqlAll, function (error, listings) {
            if (error) reject('some err getting listings');
            final.listings = listings;
            resolve(final);
        });
    });
}


function getSqlStatement(query){
    var countStatement = "";

    // #1
    if (query.coordinates) {
        const radius = 10; // km
        const angle_radius = radius / 111; // Every lat|lon degree is ~ 111Km
        const min_lat = query.coordinates.lat - angle_radius;
        const max_lat = query.coordinates.lat + angle_radius;
        const min_lng = query.coordinates.lng - angle_radius;
        const max_lng = query.coordinates.lng + angle_radius;
        countStatement +=  "latitude BETWEEN " + min_lat + " AND " + max_lat
            + " AND longitude BETWEEN " + min_lng + " AND " + max_lng; // + connection.escape(id);

        if (query.guests){
            countStatement+= " AND ";
        }
    }
    // #2
    if (query.guests) {
        countStatement += "max_guest <= " + query.guests;
        if (query.from && query.to){
            countStatement+= " AND ";
        }
    }
    // #3
    if (query.from && query.to) {
        const from = query.from;
        const to = query.to;
        countStatement += "id NOT IN (SELECT listing_id FROM Reservations" +
            " WHERE '" + to + "' BETWEEN checkin AND checkout" +
            " OR checkout BETWEEN '" + from + "' AND '" + to + "'" +
            " OR '" + from + "' BETWEEN checkin AND checkout" +
            " OR checkin BETWEEN '" + from + "' AND '" + to + "')";
    }

    // #4
    var limit = "";
    if (query.offset) {
        var offset = (query.offset - 1) * 18;
        limit = " LIMIT " + offset + ",18";
    } else {
        limit = " LIMIT 18";
    }

    const listingStatement = countStatement + limit;
    return {countStatement: countStatement, listingStatement: listingStatement};
}




function toGeorgian(date) {
    const p_date = (date).split('-');
    const g_date = jalali.toGregorian(parseInt(p_date[0]), parseInt(p_date[1]), parseInt(p_date[2]));
    return g_date.gy + "-" + g_date.gm + "-" + g_date.gd;
}






module.exports = router;