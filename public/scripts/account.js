function checkEmail() {
    if($('#newEmail')[0].checkValidity()) {
        $('#newEmailButton').removeAttr('disabled');
    }
    else{
        $('#newEmailButton').attr('disabled', 'disabled');
    }
}
function updateEmail() {
    if($('#newEmail')[0].checkValidity()) {
        if(confirm("You will be logged out if your email is changed successfuly, do you want to continue?")) {
            const callable = firebase.functions().httpsCallable('updateEmail');
            hideProfileMessages();
            showOverlay();
            callable({email: $('#newEmail').val()}).then(function(result) {
                if(result.data.success) {
                    $('#newEmail').val('')
                    $('#newDisplayNameButton').attr('disabled', 'disabled');
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
    if($('#newDisplayFirstName')[0].checkValidity() && $('#newDisplayLastName')[0].checkValidity()) {
        $('#newDisplayNameButton').removeAttr('disabled');
    }
    else {
        $('#newDisplayNameButton').attr('disabled', 'disabled');
    }
}
function updateDisplayName() {
    if($('#newDisplayFirstName')[0].checkValidity() && $('#newDisplayLastName')[0].checkValidity()) {
        const update = firebase.functions().httpsCallable('updateName');
        hideProfileMessages();
        showOverlay();
        update({firstName: $('#newDisplayFirstName').val(), lastName: $('#newDisplayLastName').val()}).then(function(result) {
            if(result.data.success) {
                $('#newDisplayFirstName').val('');
                $('#newDisplayLastName').val('');
                $('#newDisplayNameButton').attr('disabled', 'disabled');
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
    if($('#newPassword')[0].checkValidity() && $('#newConfirmPassword')[0].checkValidity() && 
    $('#newPassword').val() === $('#newConfirmPassword').val() && $('#newPassword').val().length >= 6) {
        $('#newPasswordButton').removeAttr('disabled')
    }
    else {
        $('#newPasswordButton').attr('disabled', 'disabled');
    }
}
function updatePassword() {
    if($('#newPassword')[0].checkValidity() && $('#newConfirmPassword')[0].checkValidity() && 
    $('#newPassword').val() === $('#newConfirmPassword').val() && $('#newPassword').val().length >= 6) {
        if(confirm("You will be logged out if your password is changed successfuly, do you want to continue?")) {
            const update = firebase.functions().httpsCallable('updatePassword');
            hideSecurityMessages();
            showOverlay();
            update({password: $('#newPassword').val(), confirm: $('#newConfirmPassword').val()}).then(function(result) {
                if(result.data.success) {
                    $('#newPassword').val('');
                    $('#newConfirmPassword').val('');
                    $('#newPasswordButton').attr('disabled', 'disabled');
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
    hide($('#profileError'));
    hide($('#profileSuccess'));
}

function profileError(error) {
    show($('#profileError'));
    hide($('#profileSuccess'));
    $('#profileError').text(error);
}
function profileSuccess(success) {
    show($('#profileSuccess'));
    hide($('#profileError'));
    $('#profileSuccess').text(success);
}
function hideSecurityMessages() {
    hide($('#securityError'));
    hide($('#securitySuccess'))
}
function securityError(eror) {
    show($('#securityError'));
    hide($('#securitySuccess'));
    $('#securityError').text(error);
}
function securitySuccess(success) {
    show($('#securitySuccess'));
    hide($('#securityError'));
    $('#securitySuccess').text(success);
}

function uploadTextOnly() {
    if($('#uploadedNotes')[0].checkValidity()) {
        showOverlay();
        hideSubmitMessages();
        const text = $('#uploadedNotes').val();
        const callable = firebase.functions().httpsCallable('uploadFile');
        callable({name: "text-only", text: text}).then(function(result) {
            if(result.data.success) {
                submitSuccess(result.data.response);
                $('#uploadedNotes').val('');
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
    hide($('#submitSuccess'));
    hide($('#submitError'));
}

function submitSuccess(success) {
    show($('#submitSuccess'));
    hide($('#submitError'));
    $('#submitSuccess').text(success);
}

function submitError(success) {
    hide($('#submitSuccess'));
    show($('#submitError'));
    $('#submitError').text(success);
}

function toggle_content() {
    if(isHidden($('#formContent'))) {
        show($('#formContent'));
        hide($('#uploadContent'));
        $('#uploadCollapsibleText').text("Upload Text");
    }
    else {
        hide($('#formContent'));
        show($('#uploadContent'));
        $('#uploadCollapsibleText').text("Upload File");
    }
}

function submitFiles() {
    if($('#fileSubmitInput')[0].checkValidity()) {
        $('#fileSubmitInput')[0].click();
    }
}