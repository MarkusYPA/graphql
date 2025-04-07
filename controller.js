import { getDoneAuditData, getGraphData, getJWT, getReceivedAuditData, getSkillsData, getUserData, getUserIdFromJWT, verifyJWT } from "./model.js";
import { fillUserInfo, loggedInView, notLoggedInView, setColumnHeights, setMode, skillsGraph, xpGraph } from "./view.js";

let loginErrorMessage;
export let contentErrorMessage;
export let loginSection;
export let usernameDisplay;
export let logoutButton;
export let infoBox;
export let lineChartContainer;
export let barChartContainer;
let modeButton;
export let isStark = false;

export const numberOfColumns = 25;

async function loadContent() {
    const userId = getUserIdFromJWT();

    // Get the data to be displayed
    const [person, personDoneAudits, auditData, graphData, skills] = await Promise.all([
        getUserData(),
        getDoneAuditData(userId),
        getReceivedAuditData(userId),
        getGraphData(userId),
        getSkillsData(),
    ]);

    fillUserInfo(person, personDoneAudits, auditData);
    xpGraph(graphData);
    skillsGraph(skills);
    setMode(isStark);
}

function updateUI() {
    contentErrorMessage.textContent = '';
    const token = localStorage.getItem("gritlabGraphQLjwt");
    const username = localStorage.getItem("gritlabGraphQLusername");

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
        localStorage.setItem("gritlabGraphQLjwt", result);  // Store JWT for future requests
        localStorage.setItem("gritlabGraphQLusername", nameOrEmail); // Store username for display
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
    localStorage.removeItem("gritlabGraphQLjwt");
    localStorage.removeItem("gritlabGraphQLusername");
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

    isStark = localStorage.getItem('theme') === 'stark';
    setMode(isStark)

    if (await verifyJWT()) { // Check login state on page load
        updateUI();
        loadContent();
    } else {
        notLoggedInView();
    }
})

function toggleMode() {
    if (isStark) {
        localStorage.setItem('theme', 'mild');
    } else {
        localStorage.setItem('theme', 'stark');
    }
    isStark = !isStark;
    setMode(isStark);
}