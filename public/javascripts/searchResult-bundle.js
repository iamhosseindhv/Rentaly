(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.myModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
 * Created by iamhosseindhv on 02/08/2017.
 */
var queryString = require('query-string');


$(document).ready(function() {

    //when result cell hovered, related marker gets highlighted
    $('.result-cell')
        .mouseenter(function() {
            resultCellHovered(this.id);
        })
        .mouseleave(function() {
            for (var i=0; i<markers.length; i++){
                if (markers[i].id == this.id){
                    markers[i].setIcon(null);
                }
            }
        });


    var toggle = 0;
    $('.toggle-results-map').click(function () {
        if (toggle == 0){
            $('#main-wrap').hide();
            $('#sidebar-wrap').show();
            google.maps.event.trigger(map, 'resize');
            fitMarkers();
            $(this).text('List');
            toggle = 1;
        } else {
            $('#main-wrap').show();
            $('#sidebar-wrap').hide();
            $(this).text('Map');
            toggle = 0;
        }
    });

    const customOptions = {
        placeholder: "روز / ماه / سال",
        twodigit: true,
        closeAfterSelect: true,
        buttonsColor: "blue",
        forceFarsiDigits: true,
        markToday: true,
        markHolidays: true,
        highlightSelectedDay: true,
        sync: true,
        gotoToday: true,
    };
    kamaDatepicker('from-date', customOptions);
    kamaDatepicker('to-date', customOptions);


    $('#logout-btn').click(function () {
        $.ajax({
            type: 'POST',
            url: '/authenticate/logout',
            success: function(data) {
                //console.log(data.status);
                location.reload();
            },
            error: function (data) {
                //console.log(data);
            }
        });
    });


    $('#login-signin-btn').click(function () {
        $('.base-layer').css('display', 'flex');
    });


    $('#guestPicker').change(function () {
        searchGuests(jQuery(this).val());
    });

});



function createPagination(listings_count) {
    var parent = $('<ul class="pagination">').appendTo('#pagination');
    const divided = listings_count / 18;
    const noOfPages = Math.ceil(divided);

    for (var i=0 ; i < noOfPages ; i++){
        var item = $('<li class="item"></li>').appendTo(parent);
        item.text(i+1);
    }

    //making one of the pages active
    var queried = queryString.parse(location.search);
    if (queried.offset){
        parent.children('li:nth-child(' + queried.offset + ')').addClass('active');
    } else {
        parent.children('li:first').addClass('active');
    }

    $('.item').click(function () {
        refresh({
            offset: $(this).text()
        });
    });
}


function searchDates() {
    const fromDate = ($('#from-date').val()).split('/').join('-');
    const toDate = ($('#to-date').val()).split('/').join('-');
    const isDatesProvided = toDate && fromDate;
    if (!isDatesProvided) {
        alert('Please enter dates');
    } else {
        if (!isGreaterThan(fromDate, toDate)){
            alert('INVALID DATES: FromDate must be greater than ToDate');
        } else {
            //everything is alright
            refresh({
                from: fromDate,
                to: toDate
            });
        }
    }
}


function refresh(parameters) {
    const splitted = location.pathname.split('/');
    var parsed = queryString.parse(location.search);
    for (var key in parameters){
        parsed[key] = parameters[key];
    }
    //update browser's url
    const newUrl = [location.protocol, '//', location.host, location.pathname].join('') + "?" + queryString.stringify(parsed);
    window.history.replaceState("", "", newUrl);
    //set location if there is any
    if (splitted.length === 4 && splitted[2] !== ""){
        parsed.location = splitted[2];
    }
    //now make ajax request and reload data
    const url = "http://localhost:3000/api/explore?" + queryString.stringify(parsed);
    myBundle.queryNewListings(url);
}


function isGreaterThan(f, t) {
    const from = f.split('-');
    const to = t.split('-');
    const fromDate = new Date(from[0], from[1], from[2]);
    const toDate = new Date(to[0], to[1], to[2]);
    if (toDate > fromDate){
        return true;
    } else {
        return false;
    }
}



function searchGuests(val) {
    refresh({
        guests: val
    });
}


module.exports = {
    createPagination: createPagination,
    searchDates: searchDates
};
},{"query-string":2}]},{},[4])(4)
});