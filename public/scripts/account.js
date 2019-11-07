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
        if(confirm("You will be logged out if your email is changed successfuly, do you want to continue?")) {
            const callable = firebase.functions().httpsCallable('updateEmail');
            hideProfileMessages();
            showOverlay();
            callable({email: constants.newEmail.value}).then(function(result) {
                if(result.data.success) {
                    constants.newEmail.value = '';
                    constants.newDisplayNameButton.setAttribute('disabled', 'disabled');
                    profileSuccess(result.data.response)
                    return firebase.auth().signOut().then(function() {
                        window.location = '/';
                    });
                }
                else {
                    profileError(result.data.response)
                }
                hideOverlay()
            }).catch(function(error) {
                profileError(error.message);
                hideOverlay();
            });
        }
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
        update({firstName: constants.newDisplayFirstName.value, lastName: constants.newDisplayLastName.value}).then(function(result) {
            if(result.data.success) {
                constants.newDisplayFirstName.value = '';
                constants.newDisplayLastName.value = '';
                constants.newDisplayNameButton.setAttribute('disabled', 'disabled');
                profileSuccess(result.data.response);
                location.reload();
            }
            else {
                profileError(result.data.response);
            }
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
        if(confirm("You will be logged out if your password is changed successfuly, do you want to continue?")) {
            const update = firebase.functions().httpsCallable('updatePassword');
            hideSecurityMessages();
            showOverlay();
            update({password: constants.newPassword.value, confirm: constants.newConfirmPassword.value}).then(function(result) {
                if(result.data.success) {
                    constants.newPassword.value = '';
                    constants.newConfirmPassword.value = '';
                    constants.newPasswordButton.setAttribute('disabled', 'disabled');
                    securitySuccess(result.data.response);
                    return firebase.auth().signOut().then(function() {
                        window.location = '/';
                    });
                }
                else {
                    securityError(result.data.response);
                }
                hideOverlay()
            }).catch(function(error) {
                securityError(error.message);
                hideOverlay();
            });
        }
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
    
}

function uploadTextOnly() {
    if(constants.uploadedNotes.checkValidity()) {
        showOverlay();
        hideSubmitMessages();
        const text = constants.uploadedNotes.value;
        const callable = firebase.functions().httpsCallable('uploadFile');
        callable({name: "text-only", text: text}).then(function(result) {
            if(result.data.success) {
                submitSuccess(result.data.response);
                constants.uploadedNotes.value = "";
            }
            else {
                submitError(result.data.response);
            }
            hideOverlay();
        }).catch(function(error) {
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

function toggle_content() {
    if(isHidden(constants.formContent)) {
        show(constants.formContent);
        hide(constants.uploadContent);
        constants.uploadCollapsibleText.innerText = "Upload Text";
    }
    else {
        hide(constants.formContent);
        show(constants.uploadContent);
        constants.uploadCollapsibleText.innerText = "Upload File";
    }
}

function submitFiles() {
    if(constants.fileSubmitInput.checkValidity()) {
        constants.fileSubmitInput.click();
    }
}