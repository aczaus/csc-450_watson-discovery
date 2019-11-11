$(document).mouseup(function(e) 
{
    var container = $("#accountPanel");
    if (isShown(container) && !container.is(e.target) && container.has(e.target).length === 0) 
    {
        hide(container);
    }
});

function toggleAccountPanel() {
    toggle($('#accountPanel'));
}

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

var queryInProgress = false;
function queryFirebase() {
    if(queryInProgress) {
        return;
    }
    queryInProgress = true;
    const query = $('#querySearch').val();
    $('#querySearch').val('');
    const chatBox = $('#chatBox');
    const user = createUserMessage(query);
    chatBox.append(user);
    const ibm = createIBMMessage('.');
    chatBox.append(ibm);
    ibm[0].scrollIntoView(false);

    const ibmInterval = setInterval(function() {
        switch(ibm.text()) {
            case '.':
                ibm.text('..');
                return;
            case '..':
                ibm.text('...');
                return;
            case '...':
                ibm.text('.');
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
        ibm.text(text);
        queryInProgress = false;
        ibm[0].scrollIntoView(false);
    })
    .catch(function(error) {
        console.log(error);
        clearInterval(ibmInterval);
        ibm.text("An Error Occured Please Try again later");
        queryInProgress = false;
        ibm[0].scrollIntoView(false);
    });

}


function createUserMessage(message) {
    const e = $('<div/>');
    e.addClass('userMessage');
    e.text(message);
    return e;
}

function createIBMMessage(message) {
    const e = $('<div/>');
    e.addClass('ibmMessage');
    e.text(message);
    return e;
}