document.addEventListener("DOMContentLoaded", function() {
    firebase.functions().useFunctionsEmulator('http://localhost:5001');
});