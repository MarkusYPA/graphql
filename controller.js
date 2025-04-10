import { getDoneAuditData, getGraphData, getJWT, getReceivedAuditData, getSkillsData, getUserData, getUserIdFromJWT, verifyJWT } from "./model/model.js";
import { skillsGraph, xpGraph } from "./view/svgs.js";
import { fillUserInfo, loggedInView, notLoggedInView, setMode } from "./view/view.js";

export let loginErrorMessage;
export let contentErrorMessage;
export let loginSection;
export let usernameDisplay;
export let logoutButton;
export let infoBox;
export let lineChartContainer;
export let barChartContainer;
let modeButton;

export const numberOfColumns = 25;

async function loadContent() {
    const userId = getUserIdFromJWT();

    // Get the data to be displayed
    try {
        var userDataPoints = await Promise.all([
            getUserData(),
            getDoneAuditData(userId),
            getReceivedAuditData(userId),
            getGraphData(userId),
            getSkillsData(),
        ]);
    } catch (err) {
        console.error("Failed to fetch data:", err);
        return;
    }

    const [person, personDoneAudits, auditData, graphData, skills] = userDataPoints;
    fillUserInfo(person, personDoneAudits, auditData);
    xpGraph(graphData);
    skillsGraph(skills);
    setMode();
}

function updateUI() {
    contentErrorMessage.textContent = '';
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (token && username) {
        loggedInView(username);
    } else {
        notLoggedInView();
    }
}

async function logIn(e) {
    e.preventDefault(); // don't reload at submit form
    const nameOrEmail = e.target.useremail.value;
    const password = e.target.password.value;
    const credentials = btoa(`${nameOrEmail}:${password}`); //encode string in base-64

    const [success, result] = await getJWT(credentials);

    if (success) {
        localStorage.setItem("jwt", result);  // Store JWT for future requests
        localStorage.setItem("username", nameOrEmail); // Store username for display
        loginErrorMessage.textContent = '';
        console.log("Login successful");
        updateUI();
        loadContent();
    } else {
        console.error("Login failed:", result);
        loginErrorMessage.textContent = result;
    }
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    updateUI();
    console.log("Logged out");
}

addEventListener("DOMContentLoaded", async function () {
    loginErrorMessage = document.getElementById("login-error-message");
    loginSection = document.getElementById('login-section')
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");
    modeButton = document.getElementById("mode-button");
    contentErrorMessage = document.getElementById('content-error-message');
    infoBox = document.querySelector('#personal-info');
    lineChartContainer = document.querySelector('#line-chart');
    barChartContainer = document.querySelector('#bar-chart');

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);
    modeButton.addEventListener("click", toggleMode);     

    if (await verifyJWT()) { // Check login state on page load
        updateUI();
        loadContent();
    } else {
        notLoggedInView();
    }

    setMode()
})

function toggleMode() {
    if (localStorage.getItem('theme') === 'stark') {
        localStorage.setItem('theme', 'mild');
    } else {
        localStorage.setItem('theme', 'stark');
    }
    setMode();
}