import { getDoneAuditData, getReceivedAuditData, getUserData, getUserIdFromJWT } from "./data.js";
import { dataContainer, numberOfColumns } from "./main.js";

export async function fillUserInfo() {
    const userId = getUserIdFromJWT();
    const person = await getUserData(userId);
    const personDoneAudits = await getDoneAuditData(userId);
    const personReceivedAudits = await getReceivedAuditData(userId);

    const infoBox = document.createElement('div');
    infoBox.id = 'user-info';

    // container for personal info and audits
    const personInfoContainer = document.createElement('div');
    const personalInfo = document.createElement('div');
    personInfoContainer.id = 'person-info-container';
    personInfoContainer.classList.add('key-value-title');
    personalInfo.id = 'personal-info';
    personalInfo.classList.add('key-value-info');

    const titleRow = document.createElement('span');
    const row2key1 = document.createElement('span');
    const row2val1 = document.createElement('span');
    const row3key1 = document.createElement('span');
    const row3val1 = document.createElement('span');
    const row4key1 = document.createElement('span');
    const row4val1 = document.createElement('span');

    titleRow.textContent = person.firstName + ' ' + person.lastName;
    row2key1.textContent = 'id number:';
    row2val1.textContent = person.id;
    row3key1.textContent = 'username:';
    row3val1.textContent = person.login;
    row4key1.textContent = 'experience points:';
    row4val1.textContent = person.totalXP;

    const row2key2 = document.createElement('span');
    const row2val2 = document.createElement('span');
    const row3key2 = document.createElement('span');
    const row3val2 = document.createElement('span');
    const row4key2 = document.createElement('span');
    const row4val2 = document.createElement('span');

    row2key2.textContent = 'audits done:';
    row2val2.textContent = personDoneAudits;
    row3key2.textContent = 'audits received:';
    row3val2.textContent = personReceivedAudits;
    row4key2.textContent = 'audits ratio:';
    row4val2.textContent = Math.round(person.auditRatio * 1000) / 1000;

    personInfoContainer.appendChild(titleRow);

    personalInfo.appendChild(row2key1);
    personalInfo.appendChild(row2val1);
    personalInfo.appendChild(row2key2);
    personalInfo.appendChild(row2val2);

    personalInfo.appendChild(row3key1);
    personalInfo.appendChild(row3val1);
    personalInfo.appendChild(row3key2);
    personalInfo.appendChild(row3val2);

    personalInfo.appendChild(row4key1);
    personalInfo.appendChild(row4val1);
    personalInfo.appendChild(row4key2);
    personalInfo.appendChild(row4val2);

    personInfoContainer.appendChild(personalInfo);
    infoBox.appendChild(personInfoContainer);

    dataContainer.appendChild(infoBox);
}


export function setColumnHeights(grow) {
    const colContainer = document.querySelector('#login-columns');
    const oldColumns = Array.from(document.getElementsByClassName('column'));

    let height = '0vh'
    for (let i = 0; i < numberOfColumns; i++) {
        if (grow) height = (Math.random() * 15 + 60) + 'vh';

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