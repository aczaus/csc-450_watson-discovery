function toggleAccountPanel() {
    toggle(constants.accountPanel);
}

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

function queryFirebase() {
    const query = constants.querySearch.value;
    console.log(query);
    const callable = firebase.functions().httpsCallable('queryDatabase');
    callable({query: query})
    .then(function(result) {
        console.log(result)
        constants.queryText.innerText = result.data.response.passages[0].passage_text;
    })
}