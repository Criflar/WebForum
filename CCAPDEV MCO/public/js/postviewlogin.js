// Open the Login Popup
document.querySelector("#login-button").addEventListener("click", function () {
    document.querySelector("#login-overlay").classList.add("active");
    document.querySelector("#login-overlay .popup").classList.add("active");
});

// Close the Popup
document.querySelectorAll(".popup .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        btn.closest(".overlay").classList.remove("active");
        btn.closest(".popup").classList.remove("active");
    });
});

// Switch from Login Popup to Sign-up Popup
document.querySelector("#open-signup").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector("#login-overlay").classList.remove("active");
    document.querySelector("#login-overlay .popup").classList.remove("active");

    document.querySelector("#signup-overlay").classList.add("active");
    document.querySelector("#signup-overlay .popup").classList.add("active");
});

// Switch from Sign-up Popup to Login Popup
document.querySelector("#open-signin").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector("#signup-overlay").classList.remove("active");
    document.querySelector("#signup-overlay .popup").classList.remove("active");

    document.querySelector("#login-overlay").classList.add("active");
    document.querySelector("#login-overlay .popup").classList.add("active");
});
