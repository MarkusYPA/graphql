import { introspection, me, transactions2 } from "./queries.js";

let loginErrorMessage
let loginSection
let usernameDisplay
let logoutButton
let dataContainer

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

function getUserIdFromJWT() {
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    // jwt parts separated by dots: 0 header, 1 payload, 2 signature - Decode payload:
    const payload = JSON.parse(atob(token.split(".")[1]));
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
        loginSection.style.display = 'flex';
        dataContainer.innerHTML = '';
        setColumnHeights(true);
    }
}

async function runQuery(queryArgs, usrId) {
    const token = localStorage.getItem("jwt");

    const res = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            query: queryArgs[0] + usrId + queryArgs[1]
        })
    });

    const data = await res.json();
    if (data.errors) {
        console.log(data.errors[0].message);
        return;
    }

    return data.data;
}

async function getUserData(usrId) {
    const data = await runQuery(me, usrId);
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

    delete person.xps;
    person.totalXP = totalXP;
    return person
}

async function fillUserInfo() {
    let person = await getUserData(getUserIdFromJWT());
    console.log(person);

    const infoBox = document.createElement('div');
    infoBox.id = 'user-info';

    const row1 = document.createElement('span');
    const row2 = document.createElement('span');
    const row3 = document.createElement('span');
    row1.textContent = person.firstName + ' ' + person.lastName;
    row2.textContent = person.id + ' ' + person.login;
    row3.textContent = person.totalXP + ' ' + 'XP';

    infoBox.appendChild(row1);
    infoBox.appendChild(row2);
    infoBox.appendChild(row3);
    dataContainer.appendChild(infoBox);
}

function createColumns(oldColumns, numberOfColumns) {
    const colContainer = document.querySelector('#login-columns');

    for (let i = 0; i < numberOfColumns; i++) {
        const height = (Math.random() * 15 + 60) + 'vh';

        let col;
        if (oldColumns.length != numberOfColumns) {
            col = document.createElement('div');
            col.classList.add('column');
            col.style.width = `${100/numberOfColumns}vw`;
            col.style.height = height;
            colContainer.appendChild(col);
        } else {
            oldColumns[i].style.height = height;
        }
    }
}


function setColumnHeights(grow) {
    const columns = Array.from(document.getElementsByClassName('column'));
    if (grow) {
        createColumns(columns, 20);
    } else {
        columns.forEach((c) => c.style.height = '0vh');
    }
}

async function start() {
    fillUserInfo();
}

addEventListener("DOMContentLoaded", function () {
    loginErrorMessage = document.getElementById("errorMessageLogin");
    loginSection = document.getElementById('login-section')
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");
    dataContainer = document.getElementById("data-container");

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);

    updateUI(); // Check login state on page load
})