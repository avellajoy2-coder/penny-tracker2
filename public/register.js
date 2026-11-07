

const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {

    const name = document.getElementById("name").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (name === "" || password.length < 4) {
        e.preventDefault();
        alert("Enter a name and a password of at least 4 characters");
        return;
    }

    if (password !== confirmPassword) {
        e.preventDefault();
        alert("Passwords do not match!");
        return;
    }

});
