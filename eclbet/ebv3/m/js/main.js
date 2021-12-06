$(document).ready(function() {
    var urlPath = window.location.pathname;
    var getUrl = $(location).attr("pathname");
    getUrl = getUrl.split("/");
    var getCountryType = getUrl[2];
    var pageLanguage = sessionStorage.getItem("ecl_language");
    if ($(".customSwiperWrapper").length > 0) {
        var customCarouselElements = $(".customSwiperWrapper").html();
        $(".customSwiperWrapper").append(customCarouselElements);
        $(".customSwiperWrapper").prepend(customCarouselElements);
        customCarousel();
    }
    if ($(".customSwiperWrapper").length > 0) {
        $(".customSwiperContainer").mouseenter(function() {
            $(".customSwiperWrapper").addClass("pauseAnimation");
            customCarousel();
        }).mouseleave(function() {
            $(".customSwiperWrapper").removeClass("pauseAnimation");
            customCarousel();
        });
        $(".customSwiperWrapper").draggable({
            axis: "x",
            drag: function(event, ui) {
                stopDragging();
            },
            stop: function(ev, ui) {
                var customCarouselPos = parseInt($(".customSwiperWrapper").css("left").slice(0, -2));
                var elementWidth = $(window).width() / 2;
                var firstElement = $(".customSwiperWrapper>div").eq(0);
                var customCarouselPosition = elementWidth * 4;
                if (customCarouselPos < -elementWidth + -customCarouselPosition) {
                    numberOfElementPassedOri = (customCarouselPos / (elementWidth * 4)).toString();
                    numberOfElementPassed = numberOfElementPassedOri.split(".");
                    numberOfElementPassed = parseInt(numberOfElementPassed[0].replace("-", ""));
                    elementToAppend = $(".customSwiperWrapper>div").eq(numberOfElementPassed).prevAll().toArray().reverse();
                    $(".customSwiperWrapper").append(elementToAppend);
                    $(".customSwiperWrapper").css("left", customCarouselPos + elementWidth * numberOfElementPassed);
                }
            },
        });
    }
    function customCarousel() {
        var customCarouselSpeed = 20;
        var elementWidth = $(".customSwiperItem").outerWidth();
        var customCarouselPosition = elementWidth * 18;
        var customCarouselPos = $(".customSwiperWrapper").css("left").slice(0, -2);
        if (!$(".customSwiperWrapper").hasClass("pauseAnimation")) {
            $(".customSwiperWrapper").css("left", customCarouselPos - 0.3);
            if (customCarouselPos < -elementWidth + -customCarouselPosition) {
                var firstElement = $(".customSwiperWrapper>div").eq(0);
                customCarouselPos = $(".customSwiperWrapper").css("left").slice(0, -2);
                if (customCarouselPos < -elementWidth) {
                    $(".customSwiperWrapper").append(firstElement);
                    $(".customSwiperWrapper").css("left", -customCarouselPosition);
                }
            }
            setTimeout(customCarousel, customCarouselSpeed);
        } else {
            $(".customSwiperWrapper").css({
                left: customCarouselPos
            });
        }
    }
    function stopDragging() {
        $(".customSwiperContainer").mouseleave(function() {
            $(".customSwiperContainer").trigger("mouseup");
        });
    }
    function loadAnimation() {
        $(".customSwiperWrapper").removeClass("pauseAnimation");
        customCarousel();
        clearTimeout(loadAnimtionTime);
    }
    $(".countryWrapper").click(function() {
        $(".countryWrapper").removeClass("active");
        $(this).addClass("active");
    });
    $("#sideMenuIcon").click(function() {
        $(this).toggleClass("open");
        if ($(this).hasClass("open")) {
            openNav();
        } else {
            closeNav();
        }
    });
    $(".overlay").click(function() {
        if ($("#sideMenuIcon").hasClass("open")) {
            $("#sideMenuIcon").toggleClass("open");
            closeNav();
        }
    });
    $('.dropdownContentWrapper').each(function() {
        var $dropdown = $(this).find('.dropdownTitleWrapper');
        $dropdown.parent().find('.dropdownDescWrapper').not(".defaultShow").hide();
        $($dropdown).click(function(e) {
            e.preventDefault();
            $div = $(".dropdownDescWrapper", $dropdown.parent());
            $div.slideToggle();
            $('.down-arrow', $dropdown.parent()).toggleClass('flip');
            var target = $('.down-arrow').not($('.down-arrow', $dropdown.parent())).get();
            $(target).each(function() {
                if ($(this).hasClass('flip')) {
                    $(this).toggleClass('flip');
                }
            })
            $(".dropdownDescWrapper").not($div).hide();
            return false;
        });
    });
    $(".faqOption").click(function() {
        var option = $(this).data('option');
        $('#' + option).find('.dropdownContentWrapper').each(function(i, obj) {
            if (i == 0) {
                $(obj).find('.dropdownDescWrapper').show();
            } else {
                $(obj).find('.dropdownDescWrapper').hide();
            }
        });
        $('.faqTypeWrapper').hide();
        $(".faqOption").removeClass('selectedOption');
        $(".dropdownTitle").html($(this).text());
        $('#' + option).show();
        $(this).addClass('selectedOption');
    });
    $("#defaultDropdownOpen").click();
    function openNav() {
        $("#sidebar").css({
            left: "0"
        });
        $("body").css({
            overflow: "hidden"
        });
        $(".overlay").css({
            display: "block"
        });
    }
    function closeNav() {
        $("#sidebar").css({
            left: ""
        });
        $("body").css({
            overflow: ""
        });
        $(".overlay").css({
            display: "none"
        });
    }
});
