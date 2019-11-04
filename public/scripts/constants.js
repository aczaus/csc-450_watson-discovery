const constants = {};
document.addEventListener("DOMContentLoaded", function() {
    constants.loginBox = document.getElementById('loginBox');
    constants.registerBox = document.getElementById('registerBox');
    constants.registerButton = document.getElementById('registerSubmit');
    constants.loginButton = document.getElementById('loginSubmit');
    constants.loginEmail = document.getElementById('loginEmail');
    constants.loginPassword = document.getElementById('loginPassword');
    constants.firstName = document.getElementById('firstName');
    constants.lastName = document.getElementById('lastName');
    constants.registerEmail = document.getElementById('registerEmail');
    constants.registerPassword = document.getElementById('registerPassword');
    constants.confirmPassword = document.getElementById('confirmPassword');
    constants.overlay = document.getElementById('overlay');
    constants.loginError = document.getElementById('loginError');
    constants.registerError = document.getElementById('registerError');
    constants.accountPanel = document.getElementById('accountPanel');
    constants.avatar = document.getElementById('avater');
    constants.signin = document.getElementById('signin');
    constants.newEmail = document.getElementById('newEmail');
    constants.newEmailButton = document.getElementById('newEmailButton');
    constants.newDisplayFirstName = document.getElementById('newDisplayFirstName');
    constants.newDisplayLastName = document.getElementById('newDisplayLastName');
    constants.newDisplayNameButton = document.getElementById('newDisplayNameButton');
    constants.newPassword = document.getElementById('newPassword');
    constants.newConfirmPassword = document.getElementById('newConfirmPassword');
    constants.newPasswordButton = document.getElementById('newPasswordButton');
    constants.profileError = document.getElementById('profileError');
    constants.profileSuccess = document.getElementById('profileSuccess');
    constants.securityError = document.getElementById('securityError');
    constants.securitySuccess = document.getElementById('securitySuccess');
    constants.uploadedNotes = document.getElementById('uploadedNotes');
    constants.submitNotes = document.getElementById('submitNotes');
    constants.submitSuccess = document.getElementById('submitSuccess');
    constants.submitError = document.getElementById('submitError');
});
let overlayTimeout;
function showOverlay() {
    overlayTimeout = setTimeout(hideOverlay, 10000);
    show(constants.overlay);
}

function hideOverlay() {
    clearTimeout(overlayTimeout);
    hide(constants.overlay);
}

function hide(element) {
    element.classList.remove('show');
    element.classList.add('hide');
}

function show(element) {
    element.classList.remove('hide');
    element.classList.add('show');
}

function isHidden(element) {
    return element.classList.includes('hide');
}

function isShown(element) {
    return element.classList.includes('show');
}