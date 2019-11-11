function signOut() {
    showOverlay()
    hide($('#accountPanel'));
    firebase.auth().signOut()
    .then(function() {
        window.location = '/';
    })
    .catch(function(error) {
        hideOverlay();
    });
}