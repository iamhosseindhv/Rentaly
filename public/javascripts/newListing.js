/**
 * Created by iamhosseindhv on 30/09/2017.
 */

$(document).ready(function() {

    $("#my-form").submit(function(e) {
        //avoid executing the actual submit of the form.
        e.preventDefault();
        initLoading();

        $.ajax({
            type: 'POST',
            url: '/edit/new-listing',
            data: $("#my-form").serialize(),
            success: function(data) { handleFormSuccess(data); },
            error: function (data) { handleFormFailure(data); }
        });
    });

});

function handleFormSuccess(data) {
    const propertyErrors = $('#errors--property-details');
    const locationErrors = $('#errors--location');
    const bookingErrors = $('#errors--booking-details');
    [propertyErrors, locationErrors, bookingErrors].forEach(function (div) {
        $(div).empty();
    });

    if (!data.isValidInputs){
        const property = data.message.propery_details;
        const location = data.message.location;
        const booking = data.message.booking_details;

        property.forEach(function (err) {
            $(propertyErrors).append('<li>' + err.description + '</li>');
        });
        location.forEach(function (err) {
            $(locationErrors).append('<li>' + err.description + '</li>');
        });
        booking.forEach(function (err) {
            $(bookingErrors).append('<li>' + err.description + '</li>');
        });
    } else {
        $('.submit-btn').css('background-color', '#16b74f');
        $('#success-report').css('visibility', 'visible');
        window.setTimeout( function () {
            window.location = '/dashboard/rooms';
        }, 5000 );
    }
    loadingDidEnd();
}

function handleFormFailure(data) {
    console.log('An error occurred.');
    console.log(data);
}

function initLoading() {
    $('.submit-btn').prop('disabled', true);
    $('.submit-btn').css('opacity', '0.5');
    $('.loader').css('display', 'inline-block');
}

function loadingDidEnd() {
    $('.submit-btn').prop('disabled', false);
    $('.submit-btn').css('opacity', '1');
    $('.loader').css('display', 'none');
}


var map;
var markers = [];
function initMap() {
    var styles = {
        hide: [{
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{visibility: 'off'}]
            }
        ]
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.6891975, lng: 51.3889735},
        zoom: 10,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        fullscreenControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: ['roadmap','satellite'],
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });
    map.setOptions({styles: styles['hide']});

    map.addListener('click', function(event) {
        addMarker(event.latLng);
        populateFields();
    });
}

function addMarker(location) {
    if (markers.length < 1){
        var marker = new google.maps.Marker({
            position: location,
            draggable: true,
            map: map
        });
        markers.push(marker);
    } else {
        clearMarkers();
        addMarker(location);
    }
}

function populateFields() {
    const lat = markers[0].getPosition().lat();
    const lng = markers[0].getPosition().lng();
    $('#lat').val(lat);
    $('#lng').val(lng);
}

function clearMarkers() {
    markers[0].setMap(null);
    markers = [];
}