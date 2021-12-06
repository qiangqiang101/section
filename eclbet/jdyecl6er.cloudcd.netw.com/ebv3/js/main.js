function showModal(id, override) {
    if (typeof override == 'undefined') {
        override = false;
    }
    if (!override) {
        $('.modalWrapper').hide();
    }
    $(id).css('display', 'table');
    $('body').css('overflow', 'hidden');
}
function hideModal(e) {
    close_popup();
    if ($(e).is('.modalWrapper')) {
        $(e).hide();
    } else {
        $(e).parents('.modalWrapper').hide();
    }
    $('body').css('overflow', '');
}
$(document).ready(function() {
    if ($('.customSwiperWrapper').length > 0) {
        var customCarouselElements = $('.customSwiperWrapper').html();
        $('.customSwiperWrapper').append(customCarouselElements);
        $('.customSwiperWrapper').prepend(customCarouselElements);
        customCarousel();
    }
    if ($('.customSwiperWrapper').length > 0) {
        $(".customSwiperContainer").mouseenter(function() {
            $('.customSwiperWrapper').addClass('pauseAnimation');
            customCarousel();
        }).mouseleave(function() {
            $('.customSwiperWrapper').removeClass('pauseAnimation');
            customCarousel();
        });
        $('.customSwiperWrapper').draggable({
            axis: "x",
            drag: function(event, ui) {
                stopDragging();
            },
            stop: function(ev, ui) {
                var customCarouselPos = parseInt($('.customSwiperWrapper').css('left').slice(0, -2));
                var elementWidth = $(window).width() / 2;
                var firstElement = $('.customSwiperWrapper>div').eq(0);
                var customCarouselPosition = elementWidth * 4;
                if (customCarouselPos < (-elementWidth) + (-customCarouselPosition)) {
                    numberOfElementPassedOri = (customCarouselPos / (elementWidth * 4)).toString();
                    numberOfElementPassed = numberOfElementPassedOri.split('.');
                    numberOfElementPassed = parseInt(numberOfElementPassed[0].replace('-', ''));
                    elementToAppend = $('.customSwiperWrapper>div').eq(numberOfElementPassed).prevAll().toArray().reverse();
                    $('.customSwiperWrapper').append(elementToAppend);
                    $('.customSwiperWrapper').css('left', (customCarouselPos) + (elementWidth * numberOfElementPassed));
                }
            }
        })
    }
    $('body').delegate('.eb-modal-trigger', 'click', function() {
        var target = $(this).attr('target-modal');
        showModal(target);
    })
    $('body').delegate('.modalCloseBtn, .modalWrapper .overlay, .okBtn', 'click', function() {
        close_popup();
        $(this).parents('.modalWrapper').hide()
        $('body').css('overflow', '');
    });
    $('.tooltipIcon').click(function() {
        $('.tooltipIcon').not(this).siblings('.tooltipContent').removeClass('active');
        $(this).siblings('.tooltipContent').toggleClass('active');
    })
});
function customCarousel() {
    var customCarouselSpeed = 20;
    var elementWidth = $('.customSwiperItem').outerWidth();
    var customCarouselPosition = elementWidth * 18;
    var customCarouselPos = $('.customSwiperWrapper').css('left').slice(0, -2);
    if (!$('.customSwiperWrapper').hasClass('pauseAnimation')) {
        $('.customSwiperWrapper').css('left', customCarouselPos - 0.3);
        if (customCarouselPos < (-elementWidth) + (-customCarouselPosition)) {
            var firstElement = $('.customSwiperWrapper>div').eq(0);
            customCarouselPos = $('.customSwiperWrapper').css('left').slice(0, -2);
            if (customCarouselPos < -elementWidth) {
                $('.customSwiperWrapper').append(firstElement);
                $('.customSwiperWrapper').css('left', -customCarouselPosition);
            }
        }
        setTimeout(customCarousel, customCarouselSpeed);
    } else {
        $('.customSwiperWrapper').css({
            'left': customCarouselPos
        });
    }
}
function stopDragging() {
    $(".customSwiperContainer").mouseleave(function() {
        $('.customSwiperContainer').trigger('mouseup');
    })
}
function loadAnimation() {
    $('.customSwiperWrapper').removeClass('pauseAnimation');
    customCarousel();
    clearTimeout(loadAnimtionTime);
}
function showDialog(modalId, title, message) {
    $('#' + modalId).css('display', 'table');
    $('#' + modalId).find('.title').text(title);
    $('#' + modalId).find('.message').text(message);
    $('body').css('overflow', 'hidden');
}
