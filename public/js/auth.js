document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default page reload

    document.getElementById("signup-message").innerText = "Registering...";

    // Get username and password from input fields
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    if (password.length < 5) {
        document.getElementById("signup-message").innerText = "Password must be at least 5 characters.";
        return;
    }

    // Create fetch request
    const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json(); // Convert response to data

    document.getElementById("signup-message").innerText = data.message;
    document.getElementById("signup-message").style.display = "block";

    if (response.ok) {
        document.getElementById("signup-username").value = "";
        document.getElementById("signup-password").value ="";   
    }
});

document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default page reload

    // Get username and password from input fields
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    // Create fetch request
    const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe })
    });

    

    const data = await response.json();

    if (response.ok) {
        location.reload(); // Reload page 
    } else {
        document.getElementById("login-message").innerText = data.message;
        document.getElementById("login-message").style.display = "block";
    }
});

