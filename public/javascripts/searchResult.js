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