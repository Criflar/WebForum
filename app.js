
const sidebar = document.querySelector(".sidebar");
const menuButton = document.querySelector(".hamburger-icon");
let prevWidth = window.innerWidth;

const profileAvatar = document.getElementById("login-avatar");
const profileDropDownMenu = document.querySelector(".profile-dropdown-menu");


// Drop down for profile options in navbar if logged in 
if (profileAvatar != null) {
    profileAvatar.addEventListener("click", function() {
        if (profileDropDownMenu.style.display === 'none')
            profileDropDownMenu.style.display = 'block';
        else
            profileDropDownMenu.style.display = 'none';
    })

    document.addEventListener("click", function (event) {
        if (!profileAvatar.contains(event.target)) {
            profileDropDownMenu.style.display = 'none';
        }
    });
}


// Sidebar toggle
menuButton.addEventListener("click", function () {
    if (window.innerWidth > 900) 
        sidebar.classList.toggle("hidden");
    else 
        sidebar.classList.toggle("show");    
});

window.addEventListener("resize", function () {
    const currentWidth = window.innerWidth;

    if ((prevWidth > 900 && currentWidth <= 900) ||
    (prevWidth <= 900 && currentWidth > 900)) 
        sidebar.classList.remove("show", "hidden");
            
    prevWidth = currentWidth;
});




// Add Post Page
function addPostFieldValidation() {
    
    let postTitle = document.getElementById("addpost-title-input");
    const postDesc = document.getElementById("addpost-description-input");
    let valid = true;

    if (postTitle.value.trim() === '') {
        valid = false;
        postTitle.style.border = '2px solid red';
    }

    if (postDesc.value.trim() === '') {
        valid = false;
        postDesc.style.border = '2px solid red';
    }
    return valid;
}

document.getElementById("addpost-title-input").addEventListener("input", function() {
    this.style.border = '';
});

document.getElementById("addpost-description-input").addEventListener("input", function() {
    this.style.border = '';
});
