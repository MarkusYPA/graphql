import { introspection, me, transactions2 } from "./queries.js";

let loginErrorMessage
let loginSection
let usernameDisplay
let logoutButton

const columnHeights = ['55vh', '60vh', '52vh', '65vh', '57vh', '60vh', '64vh', '57vh', '54vh', '60vh'];

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
        localStorage.setItem("jwt", data);  // Store JWT for future requests
        localStorage.setItem("username", nameOrEmail); // Store username for display
        loginErrorMessage.textContent = '';
        console.log("Login successful");
        setColumnHeights(false);
        updateUI();
    } else {
        console.log("Non ok response", data);
        console.error("Login failed:", data.error);
        loginErrorMessage.textContent = data.error;
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

    // jwt parts separated by dots: 0 header, 1 payload, 2 signature - Decode payload:
    const payload = JSON.parse(atob(token.split(".")[1]));
    //console.log("payload:", payload)

    return payload.sub; // return x-hasura-user-id from payload
}

function updateUI() {
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (token && username) {
        usernameDisplay.textContent = `Logged in as ${username}`;
        logoutButton.hidden = false;
        loginSection.style.display = "none";
        setColumnHeights(false);
        start();
    } else {
        usernameDisplay.textContent = '';
        logoutButton.hidden = true;
        loginSection.style.display = "flex";
        setColumnHeights(true);
    }
}

async function runQuery(queryArg) {
    const token = localStorage.getItem("jwt");

    const res = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            query: queryArg
        })
    });

    const data = await res.json();
    if (data.errors) {
        console.log(data.errors[0].message);
        return;
    }

    return data.data;
}

async function fillUserInfo(){
    const usrId = getUserIdFromJWT();
    let data

    data = await runQuery(me);
    console.log(data[Object.keys(data)[0]]['0']);
    let person = data[Object.keys(data)[0]]['0']

    let totalXP = 0
    person.xps.forEach(xp => {
        if (
            (!xp.path.includes('piscine-go') && !xp.path.includes('piscine-js')) ||
            xp.path.endsWith('piscine-js')
        ) {
            totalXP += xp.amount;
        }
    });

    console.log("total xp:", totalXP)
}


function setColumnHeights(grow) {
    const columns = Array.from(document.getElementsByClassName('column'));
    for (let i = 0; i < columns.length; i++) {
        if (grow) {
            columns[i].style.height = columnHeights[i];
        } else {
            columns[i].style.height = "0vh";
        }
    }
}

async function start() {
    fillUserInfo();

    /*     data = await runQuery(transactions2);
        console.log(data[Object.keys(data)[0]]);
    
        data = await runQuery(introspection);
        console.log(data[Object.keys(data)[0]]); */
}

addEventListener("DOMContentLoaded", function () {
    loginErrorMessage = document.getElementById("errorMessageLogin");
    loginSection = document.getElementById('login-section')
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);

    updateUI(); // Check login state on page load
})