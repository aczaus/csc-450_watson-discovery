function checkEmail() {
    if(constants.newEmail.checkValidity()) {
        constants.newEmailButton.removeAttribute('disabled');
    }
    else{
        constants.newEmailButton.setAttribute('disabled', 'disabled');
    }
}
function updateEmail() {
    if(constants.newEmail.checkValidity()) {
        const update = firebase.functions().httpsCallable('updateEmail');
        hideProfileMessages();
        showOverlay();
        update({email: constants.newEmail.value}).then(function(user) {
            constants.newEmail.value = '';
            constants.newDisplayNameButton.setAttribute('disabled', 'disabled');
            profileSuccess("Changed email successfully!")
            hideOverlay()
        }).catch(function(error) {
            profileError(error.message);
            hideOverlay();
        });
    }
}

function checkDisplayName() {
    if(constants.newDisplayFirstName.checkValidity() && constants.newDisplayLastName.checkValidity()) {
        constants.newDisplayNameButton.removeAttribute('disabled')
    }
    else {
        constants.newDisplayNameButton.setAttribute('disabled', 'disabled');
    }
}
function updateDisplayName() {
    if(constants.newDisplayFirstName.checkValidity() && constants.newDisplayLastName.checkValidity()) {
        const update = firebase.functions().httpsCallable('updateName');
        hideProfileMessages();
        showOverlay();
        update({firstName: constants.newDisplayFirstName.value, lastName: constants.newDisplayLastName.value}).then(function(user) {
            constants.newDisplayFirstName.value = '';
            constants.newDisplayLastName.value = '';
            constants.newDisplayNameButton.setAttribute('disabled', 'disabled');
            profileSuccess("Changed display name successfully!");
            hideOverlay();
        }).catch(function(error) {
            profileError(error.message);
            hideOverlay();
        });
    }
}

function checkPassword() {
    if(constants.newPassword.checkValidity() && constants.newConfirmPassword.checkValidity() && 
    constants.newPassword.value === constants.newConfirmPassword.value && constants.newPassword.value.length >= 6) {
        constants.newPasswordButton.removeAttribute('disabled')
    }
    else {
        constants.newPasswordButton.setAttribute('disabled', 'disabled');
    }
}
function updatePassword() {
    if(constants.newPassword.checkValidity() && constants.newConfirmPassword.checkValidity() && 
    constants.newPassword.value === constants.newConfirmPassword.value && constants.newPassword.value.length >= 6) {
        const update = firebase.functions().httpsCallable('updatePassword');
        hideSecurityMessages();
        showOverlay();
        update({password: constants.newPassword.value, confirm: constants.newConfirmPassword.value}).then(function(user) {
            constants.newPassword.value = '';
            constants.newConfirmPassword.value = '';
            constants.newPasswordButton.setAttribute('disabled', 'disabled');
            securitySuccess("Changed display name successfully!");
            hideOverlay()
        }).catch(function(error) {
            securityError(error.message);
            hideOverlay();
        });
    }
}

function hideProfileMessages() {
    hide(constants.profileError);
    hide(constants.profileSuccess);
}

function profileError(error) {
    show(constants.profileError);
    hide(constants.profileSuccess);
    constants.profileError.innerText = error;
}
function profileSuccess(success) {
    show(constants.profileSuccess);
    hide(constants.profileError);
    constants.profileSuccess.innerText = success;
}
function hideSecurityMessages() {
    hide(constants.securityError);
    hide(constants.securitySuccess)
}
function securityError(eror) {
    show(constants.securityError);
    hide(constants.securitySuccess);
    constants.securityError.innerText = error;
}
function securitySuccess(success) {
    show(constants.securitySuccess);
    hide(constants.securityError);
    constants.securitySuccess.innerText = success;
}

function uploadFile() {
    if(constants.uploadedNotes.checkValidity()) {
        showOverlay();
        hideSubmitMessages();
        const text = constants.uploadedNotes.value;
        const callable = firebase.functions().httpsCallable('uploadFile');
        callable({name: "", text: text}).then(function() {
            submitSuccess("Uploaded Successfully!")
            constants.uploadedNotes.value = "";
            hideOverlay();
            location.reload();
        }).catch(error => {
            submitError(error.message);
            hideOverlay();
        });
    }
}

function hideSubmitMessages() {
    hide(constants.submitSuccess);
    hide(constants.submitError);
}

function submitSuccess(success) {
    show(constants.submitSuccess);
    hide(constants.submitError);
    constants.submitSuccess.innerText = success;
}

function submitError(success) {
    hide(constants.submitSuccess);
    show(constants.submitError);
    constants.submitError.innerText = success;
}