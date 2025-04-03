let loginErrorMessage
let loginSection
let header
let usernameDisplay
let logoutButton

addEventListener("DOMContentLoaded", function () {
    loginErrorMessage = document.getElementById("errorMessageLogin");
    loginSection = document.getElementById('login-section')
    header = document.getElementById("header");
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);

    updateUI(); // Check login state on page load
})



async function logIn(e) {
    e.preventDefault(); // don't reload at submit form
    const nameOrEmail = e.target.useremail.value;
    const password = e.target.password.value;

    const credentials = btoa(`${nameOrEmail}:${password}`); //encode string in base-64

    const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();


    if (response.ok) {
        
        localStorage.setItem("jwt", data.token);  // Store JWT for future requests
        localStorage.setItem("username", nameOrEmail); // Store username for display
        updateUI();
        loginErrorMessage.textContent = '';

        console.log("Login successful!", data);
    } else {
        console.log(data)
        console.error("Login failed:", data.error);
        loginErrorMessage.textContent = data.error;
        // display error in UI too!
    }
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    updateUI();

    console.log("Logged out");
}

function getUserIdFromJWT() {
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));  // Decode payload

    console.log("payload:", payload)

    return payload.user_id;  // Adjust key based on API docs
}

async function fetchGraphQL(query) {
    const token = localStorage.getItem("jwt");

    const response = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();
    return data;
}

function updateUI() {
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (token && username) {
        header.style.display = "block";
        usernameDisplay.textContent = `Logged in as ${username}`;
        loginSection.style.display = "none";
    } else {
        header.style.display = "none";
        loginSection.style.display = "flex";
    }
}
