document.addEventListener("DOMContentLoaded", function() {
    firebase.auth().addAuthTokenListener(function(idToken) {
        document.cookie = "__session=" + idToken + ";max-age=2592000";
    });
});


function signIn() {
    showOverlay();
    window.location = "".concat("/signin");
}

function gotoAccount() {
    showOverlay()
    window.location = "".concat("/account");
}

function gotoIndex() {
    showOverlay()
    window.location = "".concat("/");
}

function accountNavigateTo(element) {
    showOverlay();
    window.location = "".concat("/account?","navigation=", element.id);
}