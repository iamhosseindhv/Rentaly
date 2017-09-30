/**
 * Created by iamhosseindhv on 30/09/2017.
 */

$(document).ready(function() {

    $("#my-form").submit(function(e) {
        //avoid executing the actual submit of the form.
        e.preventDefault();
        $('.submit-btn').prop('disabled', true);

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
    $('.submit-btn').prop('disabled', false);   //enable button again
}



function handleFormFailure(data) {
    console.log('An error occurred.');
    console.log(data);
}