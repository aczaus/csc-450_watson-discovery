document.addEventListener("DOMContentLoaded", () => {
    firebase.functions().useFunctionsEmulator('http://localhost:5001');
});