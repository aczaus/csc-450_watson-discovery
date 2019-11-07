function signOut() {
    showOverlay()
    hide(constants.accountPanel);
    firebase.auth().signOut()
    .then(function() {
        window.location = '/';
    })
    .catch(function(error) {
        hideOverlay();
    });
}