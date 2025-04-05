import { auditsDoneQuery, auditsForGroupQuery, groupIdsQuery, introspectionQuery, transactions2, userInfoQuery } from "./queries.js";

let loginErrorMessage
let contentErrorMessage
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
    contentErrorMessage.textContent = '';
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

async function runQuery(queryArgs, id) {
    const token = localStorage.getItem("jwt");

    try {
        const res = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                query: queryArgs[0] + id + queryArgs[1]
            })
        });

        const data = await res.json();
        if (data.errors) {
            console.error("Error parsing response:", data.errors[0].message);
            contentErrorMessage.textContent = data.errors[0].message;
            return;
        }
        contentErrorMessage.textContent = '';
        return data.data;

    } catch (error) {
        console.error("Data request failed:", error);
        contentErrorMessage.textContent = error;
    }
}

async function getUserData(usrId) {
    const data = await runQuery(userInfoQuery, usrId);
    let person = data[Object.keys(data)[0]]['0'];

    person.totalXP = 0
    person.xps.forEach(xp => {
        if (
            (!xp.path.includes('piscine-go') && !xp.path.includes('piscine-js')) ||
            xp.path.endsWith('piscine-js')
        ) {
            person.totalXP += xp.amount;
        }
    });
    delete person.xps;

    return person
}

async function getDoneAuditData(usrId) {
    const data = await runQuery(auditsDoneQuery, usrId);
    const auditsDone = data[Object.keys(data)[0]];
    //console.log("audits:", audits)
    return auditsDone.length
}

async function getReceivedAuditData(usrId) {
    const data = await runQuery(groupIdsQuery, usrId);
    //let groupIds = Object.values(data[Object.keys(data)[0]]).map(v => v.groupId); // get array of user's group ids
    let groups = Object.values(data[Object.keys(data)[0]]).map(v => v); // get array of user's groups

    // await for all to resolve with Promise.all (forEach => await will not work) 
    const allAuditData = await Promise.all(
        //groupIds.map(async (id) => {
        groups.map(async (group) => {
            const data = await runQuery(auditsForGroupQuery, group.groupId);
            const theseAudits = data[Object.keys(data)[0]];   // array of audit ids for this group
            // audits in piscines can be filtered out by path here, if necessary.
            return theseAudits.length;
        })
    );

    const auditsReceived = allAuditData.reduce((sum, count) => sum + count, 0);
    console.log("Audits received:", auditsReceived);

    return auditsReceived;
}


async function fillUserInfo() {
    const userId = getUserIdFromJWT();
    const person = await getUserData(userId);
    const personDoneAudits = await getDoneAuditData(userId);
    const personReceivedAudits = await getReceivedAuditData(userId);
    
    console.log(personDoneAudits, personReceivedAudits);


    const infoBox = document.createElement('div');
    infoBox.id = 'user-info';

    const row1 = document.createElement('span');
    const row2 = document.createElement('span');
    const row3 = document.createElement('span');
    const row4 = document.createElement('span');

    row1.textContent = person.firstName + ' ' + person.lastName;
    row2.textContent = person.id + ' ' + person.login;
    row3.textContent = person.totalXP + ' XP';
    row4.textContent = personDoneAudits + ' Audits done, ' + personReceivedAudits + ' Audits received';

    infoBox.appendChild(row1);
    infoBox.appendChild(row2);
    infoBox.appendChild(row3);
    infoBox.appendChild(row4);

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
            col.style.width = `${100 / numberOfColumns}vw`;
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
    loginErrorMessage = document.getElementById("login-error-message");
    loginSection = document.getElementById('login-section')
    usernameDisplay = document.getElementById("username-display");
    logoutButton = document.getElementById("logout-button");
    dataContainer = document.getElementById("data-container");
    contentErrorMessage = this.document.getElementById('content-error-message');

    loginSection.addEventListener('submit', logIn);
    logoutButton.addEventListener("click", logout);

    updateUI(); // Check login state on page load
})