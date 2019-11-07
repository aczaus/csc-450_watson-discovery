function signInWithGoogle() {
    showOverlay(false);
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'});
    firebase.auth().signInWithPopup(provider).then(function(result) {
        window.location = '/'
    }).catch(function(error) {
        hideOverlay();
    });
}

function gotoRegister() {
    window.history.replaceState(null, "Register", "/signin?navigation=register");
    hide(constants.loginBox);
    show(constants.registerBox);
}

function gotoSignin() {
    window.history.replaceState(null, "Login", "/signin?navigation=login");
    show(constants.loginBox);
    hide(constants.registerBox);
}

function signin() {
    const email =  constants.loginEmail.value;
    const password = constants.loginPassword.value;
    showOverlay();
    hide(constants.loginError);
    firebaseLogin(email, password)
    .then(function(cred) {
        window.location = "/";
    })
    .catch(function(error) {
        showLoginError(error.message);
        hideOverlay();;
    });
}

function firebaseLogin(email, password) {
    return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(_) {
            return Promise.resolve();
        })
        .catch(function(error) {
            return Promise.reject(error)
        });
    })
    .catch(function(error) {
        return Promise.reject(error);
    });
}

function register() {
    const firstName = constants.firstName.value;
    const lastName = constants.lastName.value;
    const email = constants.registerEmail.value;
    const password = constants.registerPassword.value;
    const confirm = constants.confirmPassword.value;
    showOverlay()
    hide(constants.registerError);
    const callable = firebase.functions().httpsCallable('registerUser');
    callable({email: email, password: password, confirm: confirm, firstName: firstName, lastName: lastName}).then(function(result) {
        if(result.data.success) {
            firebaseLogin(email, password)
            .then(function() {
                window.location = '/';
            })
            .catch(function(error) {
                alert('An error occured while trying to login to account');
            });
        }
        else {
            showRegisterError(result.data.response);
            hideOverlay();
        }
    }).catch(function(error) {
        console.log(error)
        showRegisterError(error.message);
        hideOverlay();
    });
}

function showLoginError(message) {
    showError(constants.loginError, message);
}

function showRegisterError(message) {
    showError(constants.registerError, message);
}

function showError(element, message) {
    element.innerText = message;
    show(element);
}