document.addEventListener("DOMContentLoaded", function() {
    firebase.auth().onAuthStateChanged(function(user) {
        const uid = user ? user.uid : null;
        document.cookie = "__session=" + uid + ";max-age=2592000";
    });
});