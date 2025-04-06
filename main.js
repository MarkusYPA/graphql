import { fillUserInfo, setColumnHeights, skillsGraph, xpGraph } from "./graphics.js";

let loginErrorMessage;
export let contentErrorMessage;
let loginSection;
let usernameDisplay;
let logoutButton;
export let infoBox;
export let lineChartContainer;
export let barChartContainer;

export const numberOfColumns = 25;

async function logIn(e) {
    e.preventDefault(); // don't reload at submit form
    const nameOrEmail = e.target.useremail.value;
    const password = e.target.password.value;
    const credentials = btoa(`${nameOrEmail}:${password}`); //encode string in base-64

    try {
        const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("jwt", data);  // Store JWT for future requests
            localStorage.setItem("username", nameOrEmail); // Store username for display
            loginErrorMessage.textContent = '';
            console.log("Login successful");
            setColumnHeights(false);
            updateUI();
        } else {
            console.error("Login failed:", data.error);
            loginErrorMessage.textContent = data.error;
        }
    } catch (error) {
        // This catches a Cross-Origin Resource Sharing (CORS)/network error
        // Server allows loads only form its own origin
        console.error("Login request failed:", error);
        loginErrorMessage.textContent = "Login not allowed from this location";
    }
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    updateUI();
    console.log("Logged out");
}

function notLoggedInView(){
    usernameDisplay.textContent = '';
    logoutButton.hidden = true;
    loginSection.style.display = 'flex';
    infoBox.innerHTML = '';
    lineChartContainer.innerHTML = '';
    barChartContainer.innerHTML = '';

    infoBox.style.display = "none";
    lineChartContainer.style.display = "none";
    barChartContainer.style.display = "none";

    setColumnHeights(true);
}

function updateUI() {
    contentErrorMessage.textContent = '';
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (token && username) {
        usernameDisplay.textContent = `Logged in as ${username}`;
        logoutButton.hidden = false;
        loginSection.style.display = "none";

        infoBox.style.display = "flex";
        lineChartContainer.style.display = "flex";
        barChartContainer.style.display = "flex";

        setColumnHeights(false);
        start();
    } else {
        notLoggedInView();
    }
}

async function start() {
    fillUserInfo();
    xpGraph();
    skillsGraph();
}

// Check that the stored jwt is valid
async function verifyJWT() {
    const token = localStorage.getItem("jwt");
    if (!token) return false;    
    const verifyQuery = `{ user { id }}`  // 'normal' query (not nested, no arguments)

    try {
        const res = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query: verifyQuery })
        });
        return res.ok;
    } catch (error) {
        console.error("Login request failed:", error);
        loginErrorMessage.textContent = "Login not allowed from this location";
        return false;
    }
}

addEventListener("DOMContentLoaded", async function () {
    loginErrorMessage = document.getElementById("login-error-message");
    loginSection = document.getElementById('login-section')
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");
    contentErrorMessage = this.document.getElementById('content-error-message');
    infoBox = document.querySelector('#personal-info');
    lineChartContainer = document.querySelector('#line-chart');
    barChartContainer = document.querySelector('#bar-chart');

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);

    notLoggedInView();

    if (await verifyJWT()) updateUI(); // Check login state on page load
})