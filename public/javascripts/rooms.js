/**
 * Created by iamhosseindhv on 04/10/2017.
 */
$(document).ready(function () {
    const newcol = $('.newcol');
    const column4 = $('.column-4');
    const imageHeight = $('.listing-images').height() + $('.top-head').height();
    const newcolHeight = newcol.outerHeight();
    const column4Height = column4.height();

    $(document).scroll(function () {
        var newcolOffset = newcol.offset().top + newcolHeight;
        var column4Offset = column4.offset().top + column4Height;

        if (window.innerWidth > 1128){
            if (!(window.scrollY > imageHeight)){
                newcol.removeClass("column-4--fixed");
                newcol.removeClass('stick-bottom');
            } else {
                if (newcolOffset < column4Offset) {
                    newcol.addClass("column-4--fixed");
                } else {
                    newcol.removeClass("column-4--fixed");
                    newcol.addClass('stick-bottom');
                    const windowScroll = $(window).scrollTop() + newcolHeight;
                    if (newcolOffset > windowScroll) {
                        newcol.removeClass('stick-bottom');
                        newcol.addClass("column-4--fixed");
                    }
                }
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


