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

var queryInProgress = false;
function queryFirebase() {
    if(queryInProgress) {
        return;
    }
    queryInProgress = true;
    const query = constants.querySearch.value;
    constants.querySearch.value = '';
    const chatBox = document.getElementById('chatBox');
    const user = createUserMessage(query);
    chatBox.appendChild(user);
    const ibm = createIBMMessage('.');
    chatBox.appendChild(ibm);
    ibm.scrollIntoView(false);

    const ibmInterval = setInterval(function() {
        switch(ibm.innerText) {
            case '.':
                ibm.innerText = '..'
                return;
            case '..':
                ibm.innerText = '...'
                return;
            case '...':
                ibm.innerText = '.'
                return;
        }
    }, 500);

    const callable = firebase.functions().httpsCallable('queryDatabase');
    callable({query: query})
    .then(function(result) {
        let text = "Could not retrieve data from IBM."
        if(result.data.response.passages.length > 0) {
            text = result.data.response.passages[0].passage_text;
        }
        else {
            text = "No answer could be found, try rewording the question or ask another question.";
        }
        clearInterval(ibmInterval);
        ibm.innerText = text;
        queryInProgress = false;
        ibm.scrollIntoView(false);
    })
    .catch(function(_) {
        clearInterval(ibmInterval);
        ibm.innerText = "An Error Occured Please Try again later";
        queryInProgress = false;
        ibm.scrollIntoView(false);
    });

}


function createUserMessage(message) {
    const e = document.createElement('div');
    e.className = 'userMessage';
    e.innerText = message;
    return e;
}

function createIBMMessage(message) {
    const e = document.createElement('div');
    e.className = 'ibmMessage';
    e.innerText = message;
    return e;
}