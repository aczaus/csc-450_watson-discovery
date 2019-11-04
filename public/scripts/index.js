function toggleAccountPanel() {
    setAccountPanel(constants.accountPanel.classList.contains('hide'));
}

function setAccountPanel(showPanel) {
    if(showPanel) {
        show(constants.accountPanel);
    }
    else{
        hide(constants.accountPanel);
    }
}

function signOut() {
    hide(constants.accountPanel);
    firebase.auth().signOut()
    .then(function() {
        gotoIndex();
    })
    .catch(function(error) {
        hideOverlay();
    });
}