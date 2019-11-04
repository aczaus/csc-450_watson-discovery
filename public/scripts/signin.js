function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'});
    firebase.auth().signInWithPopup(provider).then(function(result) {
        gotoIndex();
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
    show(constants.overlay);
    hide(constants.loginError);
    firebaseLogin(email, password)
    .then(function(cred) {
        cred.user.getIdToken()
        .then(function(token) {
            gotoIndex();
        }).catch(function(error) {
        });
    })
    .catch(function(error) {
        showError(constants.loginError, error.message);
        hide(constants.overlay);
    });
}

function firebaseLogin(email, password) {
    return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(cred) {
            return Promise.resolve(cred);
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
    show(constants.overlay);
    hide(constants.registerError);
    const register = firebase.functions().httpsCallable('registerUser');
    register({email: email, password: password, confirm: confirm, firstName: firstName, lastName: lastName})
    .then(function(request) {
        firebaseLogin(email, password)
        .then(function() {
            window.location = '/';
        })
        .catch(function(error) {
            alert('An error occured while trying to login to account');
        });
    })
    .catch(function(error) {
        showError(constants.registerError, error.message);
        hide(constants.overlay);
    });
}

function showError(element, message) {
    element.innerText = message;
    show(element);
}