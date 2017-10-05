/**
 * Created by iamhosseindhv on 04/10/2017.
 */
$(document).ready(function () {
    const newcol = $('.newcol');
    const column4 = $('.column-4');
    const column6Header = $('.column-6-header');
    const imageHeight = $('.listing-images').height() + $('.top-head').height();
    const newcolHeight = newcol.outerHeight();
    const column4Height = column4.height();
    const windowWidth = window.innerWidth;

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
                    // alert('passed');
                    const windowScroll = $(window).scrollTop() + newcolHeight;
                    if (newcolOffset > windowScroll) {
                        newcol.removeClass('stick-bottom');
                        newcol.addClass("column-4--fixed");
                    }
                }
            } else {
                newcol.removeClass("column-4--fixed");
                newcol.removeClass('stick-bottom');
            }
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
    kamaDatepicker('checkin', customOptions);
    kamaDatepicker('checkout', customOptions);

});

function fixListingHeader() {
    $('.waste').css('display', 'block');
    $('.header').addClass("fixed");
    $('.rest').css('padding-top', '58px');
}

function unfixListingHeader() {
    $('.waste').css('display', 'none');
    $('.header').removeClass("fixed");
    $('.rest').css('padding-top', '0');
}

