let token = "";
document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().addAuthTokenListener(idToken => {
        token = idToken;
    });
});


function signIn() {
    showOverlay();
    document.cookie = "__session=" + token;
    window.location = "".concat("/signin");
}

function gotoAccount() {
    showOverlay()
    document.cookie = "__session=" + token;
    window.location = "".concat("/account");
}

function gotoIndex() {
    showOverlay()
    document.cookie = "__session=" + token;
    window.location = "".concat("/");
}

function accountNavigateTo(element) {
    showOverlay();
    document.cookie = "__session=" + token;
    window.location = "".concat("/account?","navigation=", element.id);
}