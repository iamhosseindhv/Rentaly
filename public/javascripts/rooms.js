/**
 * Created by iamhosseindhv on 04/10/2017.
 */
$(document).ready(function () {
    const newcol = $('.newcol');
    const column4 = $('.column-4');
    const column6Header = $('.column-6-header');
    const listingScrollSummary = $('.listing-scroll-summary--inner');
    const imageHeight = $('.listing-images').height() + $('.top-head').height();
    const newcolHeight = newcol.outerHeight();
    const column4Height = column4.height();
    const windowWidth = window.innerWidth;

    $(document).on('scroll', onScroll);


    $(document).scroll(function () {
        var newcolOffset = newcol.offset().top + newcolHeight;
        var column4Offset = column4.offset().top + column4Height;
        //for listing header
        if (windowWidth <= 1127 && windowWidth > 744){
            if (window.scrollY > column4Offset){ fixListingHeader() }
            else { unfixListingHeader() }
        } else {
            if (window.scrollY > imageHeight){ fixListingHeader() }
            else { unfixListingHeader() }
        }
        //for booking info window
        if (window.innerWidth > 1128){
            if (window.scrollY > imageHeight){
                if (newcolOffset < column4Offset-1) {
                    newcol.addClass("column-4--fixed");
                } else {
                    newcol.removeClass("column-4--fixed");
                    newcol.addClass('stick-bottom');
                    listingScrollSummary.css('padding-top', '12px').css('background-color', '#595959');
                    const windowScroll = $(window).scrollTop() + newcolHeight;
                    if (newcolOffset > windowScroll) {
                        newcol.removeClass('stick-bottom');
                        newcol.addClass("column-4--fixed");
                        listingScrollSummary.css('padding-top', '50px').css('background-color', '#fff');
                    }
                }
            } else {
                newcol.removeClass("column-4--fixed");
                newcol.removeClass('stick-bottom');
            }
        }
    });

    //when listing navbar item clicked
    $('.header a').click(function() {
        scrollToId(this);
    });


    //favourite button hovered
    $('.heart-btn')
        .mouseover(function() {
            $('.heart').css('fill', 'red');
        })
        .mouseout(function() {
            $('.heart').css('fill', 'transparent');
        });

    //share button hovered
    $('.share-btn')
        .mouseover(function() {
            $('.share').css('fill', '#484848');
        })
        .mouseout(function() {
            $('.share').css('fill', 'transparent');
        });

    //favourite button clicked
    $('#favourite-listing').click(function(e){
        e.preventDefault();
        const listingid = $(".column-6").attr('id');
        $.ajax({
            type: 'POST',
            url: '/edit/add-listing-to-favourite',
            data: {
                listingid: listingid
            },
            success: function(data) {
                if (data.presentLogin) {
                    $('.base-layer').css('display', 'flex'); //present login then
                } else {
                    if (data.favourited) {
                        successfullyFavourited();
                    } else {
                        //already favourited
                        alert(data.message);
                    }
                }
            },
            error: function(data) {
                console.log(data)
            }
        });
    });

    //share button clicked
    $('#share-listing').click(function(e){
        e.preventDefault();
        //you should display a window with some options for sharing
    });


    //date picker stuff
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
    kamaDatepicker('checkin', customOptions);
    kamaDatepicker('checkout', customOptions);

});

function fixListingHeader() {
    $('.waste').css('display', 'block');
    // $('.waste').css('opacity', '1');
    $('.header').addClass('fixed');
    $('.rest').css('padding-top', '58px');
}

function unfixListingHeader() {
    $('.waste').css('display', 'none');
    // $('.waste').css('opacity', '0');
    $('.header').removeClass('fixed');
    $('.rest').css('padding-top', '0');
}


function scrollToId(self) {
    const goTo = $(self).attr('href');
    const id = $(self).attr('id');
    // Desired offset, in pixels
    const offset = $('.header').height() + 25;
    const scrollTime = 500;
    if (goTo === '#details'){
        $('html, body').animate({
            scrollTop: $(goTo).offset().top - offset + 18
        }, scrollTime);
    } else {
        $('html, body').animate({
            scrollTop: $(goTo).offset().top - offset
        }, scrollTime);
    }
    activateLink(id);
}


function successfullyFavourited() {
    $('.heart-btn').css('fill', 'red !important');
    $('#favourite-detail').text('Favourited');
    $('.heart-btn')
        .off('mouseover')
        .off('mouseout');
}

function activateLink(id) {
    $('.header-main a.active').removeClass('active');
    $('#' + id).addClass('active');
}


var inview = [];
var prevView = 0;
var currentView = 0;
function onScroll(){
    inview = [];
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    prevView = currentView;
    currentView = docViewTop;


    var detailTop = $('#details').offset().top;
    var detailBottom = detailTop + $('#details').height();
    var hostTop = $('#host').offset().top;
    var hostBottom = hostTop + $('#host').height();
    var reviewTop = $('#reviews').offset().top;
    var reviewBottom = reviewTop + $('#reviews').height();
    var locationTop = $('#location').offset().top;
    var locationBottom = locationTop + $('#location').height();

    if ((detailBottom <= docViewBottom) && (detailTop >= docViewTop)) {
        inview.push('first-link');
    }
    if ((hostBottom <= docViewBottom) && (hostTop >= docViewTop)) {
        inview.push('second-link');
    }
    if ((reviewBottom <= docViewBottom) && (reviewTop >= docViewTop)) {
        inview.push('third-link');
    }
    if ((locationBottom <= docViewBottom) && (locationTop >= docViewTop)) {
        inview.push('fourth-link');
    }
    activateLink(inview[0]);
    // console.log(inview);
}


var map;
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
        // center: {lat: 35.6891975, lng: 51.3889735},
        zoom: 12,
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
}

function newMarker(lat, lng) {
    const point = new google.maps.LatLng(
        parseFloat(lat),
        parseFloat(lng));
    const cityCircle = new google.maps.Circle({
        strokeColor: '#484848',
        strokeOpacity: .8,
        strokeWeight: 2,
        fillColor: '#ad974f',
        fillOpacity: .4,
        map: map,
        center: point,
        radius: 3000
    });
    map.setCenter(point);
}