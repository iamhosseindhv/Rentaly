(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.myBundle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],2:[function(require,module,exports){
'use strict';
var strictUriEncode = require('strict-uri-encode');
var objectAssign = require('object-assign');

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		formatter(decodeURIComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

},{"object-assign":1,"strict-uri-encode":3}],3:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

},{}],4:[function(require,module,exports){
/**
 * Created by iamhosseindhv on 24/06/2017.
 */
var queryString = require('query-string');

//do the query based on map viewport
var doQueryFromMapCoordinates = function(map) {
    const ne_lat = map.getBounds().getNorthEast().lat();
    const ne_lng = map.getBounds().getNorthEast().lng();
    const sw_lat = map.getBounds().getSouthWest().lat();
    const sw_lng = map.getBounds().getSouthWest().lng();

    var parsed = queryString.parse(location.search);
    parsed.ne_lat = ne_lat;
    parsed.ne_lng = ne_lng;
    parsed.sw_lat = sw_lat;
    parsed.sw_lng = sw_lng;
    parsed.search_by_map = 'true';
    const stringified = queryString.stringify(parsed);

    //here instead of overwriting url which caused the whole page to reload,
    //you should make a AJAX call to only reload result section of the page
    location.search = stringified;
};

var doQueryFromSearchedAddress = function (selectedPlace) {
    const formattedAddress = selectedPlace.formatted_address;
    var parsed = queryString.parse(location.search);
    //reset offset
    parsed.offset = undefined;

    //update browsers url
    const path = window.location.pathname;
    const splited = path.split('/');
    var ddd = formattedAddress.split(', ').join('-');
    ddd = ddd.split(' ').join('-');
    splited[2] = ddd;
    const newUrl = splited.join('/') + "?" + queryString.stringify(parsed);
    window.history.pushState("", "", newUrl);

    //here instead of overwriting url which caused the whole page to reload,
    //you should make a AJAX call to only reload result section of the page
    parsed.location = formattedAddress;
    const url = "http://localhost:3000/api/explore?" + queryString.stringify(parsed);
    queryNewListings(url);
};

function queryNewListings(url) {
    loadingStarted();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const res = JSON.parse(this.responseText);
            const listings = res.listings;
            const listings_count = res.listings_count;
            loadNewListings(listings, listings_count);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function loadNewListings(listings, listings_count) {

    clearMarkers();
    $('#main').empty();
    $('#pagination').empty();

    for (var i=0 ; i<listings.length ; i++){
        const listing = listings[i];

        var resultCell = $('<div class="cell result-cell">').appendTo('#main');
        resultCell.attr("id", listing.id);
        <!---->
        var parentLink = $('<a>').appendTo(resultCell);
        const link = "../../rooms/" + listing.id + "?" + "queryString consisted of city, " +
            "checkin-out date, no of guests, no of adults and children";
        parentLink.attr("href", link);
        <!---->
        var box = $('<div class="box">').appendTo(parentLink);
        <!---->
        var marginFree = $('<div class="margin-free">').appendTo(box);
        <!---->
        var cellThumbnail = $('<div class="cell-thumbnail">').appendTo(marginFree);
        <!---->
        var cellThumbnail_img = $('<img class="margin-free">').appendTo(cellThumbnail);
        cellThumbnail_img.attr("src", listing.thumbnail_img);
        // cellThumbnail_img.attr("src", "/images/owl.jpg");
        <!---->
        var cellInfo = $('<div class="cell-info">').appendTo(parentLink);
        <!---->
        var firstRow = $('<div class="cell-info--row">').appendTo(cellInfo);
        var price = $('<span class="cell-info--price">').appendTo(firstRow);
        price.text(listing.price);
        var title = $('<span class="cell-info--title">').appendTo(firstRow);
        title.text(listing.title);
        <!---->
        var secondRow = $('<div class="cell-info--row">').appendTo(cellInfo);
        var type = $('<span class="cell-info--type">').appendTo(secondRow);
        type.text(listing.type);
        var bedCount = $('<span class="cell-info--bedCount">').appendTo(secondRow);
        bedCount.text(listing.bed_count + " beds");
        <!---->
        var thirdRow = $('<div class="cell-info--row">').appendTo(cellInfo);
        var review = $('<span class="cell-info--review">').appendTo(thirdRow);
        review.text(listing.review_count + " reviews");
        <!---->
        createMarker(listing.latitude, listing.longitude, listing.id);
    }
    fitMarkers();
    myModule.createPagination(listings_count);
    $('#footer-listing-count').text(listings_count);

    loadingDidFinish();

    //when result cell hovered, related marker gets highlighted
    $('.result-cell').mouseenter(function() {
        resultCellHovered(this.id);
    });
    $('.result-cell').mouseleave(function() {
        for (var i=0; i<markers.length; i++){
            if (markers[i].id == this.id){
                markers[i].setIcon(null);
            }
        }
    });
}


function loadingStarted() {
    $("#main-wrap").animate({
        scrollTop: 0
    }, 200);
    $('.overlay').show();
}

function loadingDidFinish() {
    $('.overlay').hide();
}

module.exports = {
    doQueryFromMapCoordinates: doQueryFromMapCoordinates,
    doQueryFromSearchedAddress: doQueryFromSearchedAddress,
    queryNewListings: queryNewListings
};



},{"query-string":2}]},{},[4])(4)
});