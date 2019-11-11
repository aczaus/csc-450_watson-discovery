let overlayTimeout;
function showOverlay(hasTimer) {
    hasTimer = hasTimer || true
    if(hasTimer) {
        overlayTimeout = setTimeout(hideOverlay, 10000);
    }
    show($('#overlay'));
}

function hideOverlay() {
    clearTimeout(overlayTimeout);
    hide($('#overlay'));
}

function hide(element) {
    element.removeClass('show');
    element.addClass('hide');
}

function show(element) {
    element.removeClass('hide');
    element.addClass('show');
}

function toggle(element) {
    if(isHidden(element)) {
        show(element);
    }
    else {
        hide(element);
    }
}

function isHidden(element) {
    return element.hasClass('hide');
}

function isShown(element) {
    return element.hasClass('show');
}