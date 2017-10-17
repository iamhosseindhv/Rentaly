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


