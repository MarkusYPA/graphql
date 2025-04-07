import { barChartContainer, infoBox, lineChartContainer, loginSection, logoutButton, numberOfColumns, usernameDisplay } from "../controller.js";

export function setMode() {
    const modeElementSelectors = [
        'html',
        'body',
        'header',
        'h3',
        'button',
        'input',
        '.column',
        '.user-info',
        '.key-text',
        '.chart',
        '.data-tick',
        '.grid-line',
        '.chart-line',
        '.axis-line',
        '.axis-tick',
        '.background-bar',
        '.foreground-bar',
        '#login-error-message',
        '#content-error-message',
        '#logout-button',
        '#mode-button'
    ];

    const modeElements = document.querySelectorAll(modeElementSelectors.join(','));

    if (localStorage.getItem('theme') === 'stark')
        modeElements.forEach(el => el.classList.add('stark'));
    else
        modeElements.forEach(el => el.classList.remove('stark'));
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

export function loggedInView(username){
    usernameDisplay.textContent = `Logged in as ${username}`;
    logoutButton.hidden = false;
    loginSection.style.display = "none";

    infoBox.style.display = "flex";
    lineChartContainer.style.display = "flex";
    barChartContainer.style.display = "flex";

    setColumnHeights(false);
}

export function notLoggedInView(){
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

export async function fillUserInfo(person, personDoneAudits, auditData) {

    const personReceivedAudits = auditData[0];

    // container for personal info and audits
    const personInfoContainer = document.createElement('div');
    personInfoContainer.id = 'person-info-container';
    personInfoContainer.classList.add('key-value-title');
    const gridsContainer = document.createElement('div');
    gridsContainer.id = 'grids-container';

    // title with user names
    const titleRow = document.createElement('h3');
    titleRow.textContent = person.firstName + ' ' + person.lastName;
    personInfoContainer.appendChild(titleRow);


    // first info grid with id, username and xp
    const PIContainer = document.createElement('div');
    PIContainer.classList.add('title-and-grid-container');

    const PITitle = document.createElement('h4');
    PITitle.textContent = 'User Info';
    PIContainer.appendChild(PITitle);

    const personalInfo = document.createElement('div');
    personalInfo.id = 'personal-info';
    personalInfo.classList.add('key-value-info');

    const key1 = document.createElement('span');
    const val1 = document.createElement('span');
    const key2 = document.createElement('span');
    const val2 = document.createElement('span');
    const key3 = document.createElement('span');
    const val3 = document.createElement('span');

    key1.classList.add('key-text');
    key2.classList.add('key-text');
    key3.classList.add('key-text');

    key1.textContent = 'id number:';
    val1.textContent = person.id;
    key2.textContent = 'username:';
    val2.textContent = person.login;
    key3.textContent = 't shirt size:';
    val3.textContent = person.attrs.tshirtSize;

    personalInfo.appendChild(key1);
    personalInfo.appendChild(val1);
    personalInfo.appendChild(key2);
    personalInfo.appendChild(val2);
    personalInfo.appendChild(key3);
    personalInfo.appendChild(val3);

    PIContainer.appendChild(personalInfo);
    gridsContainer.appendChild(PIContainer);

    // second info grid about audits
    const ProContainer = document.createElement('div');
    ProContainer.classList.add('title-and-grid-container');

    const ProTitle = document.createElement('h4');
    ProTitle.textContent = 'Projects Info';
    ProContainer.appendChild(ProTitle);

    const xpInfo = document.createElement('div');
    xpInfo.id = 'audit-info';
    xpInfo.classList.add('key-value-info');

    const xpkey1 = document.createElement('span');
    const xpval1 = document.createElement('span');
    const xpkey2 = document.createElement('span');
    const xpval2 = document.createElement('span');

    xpkey1.classList.add('key-text');
    xpkey2.classList.add('key-text');

    xpkey1.textContent = 'experience points:';
    xpval1.textContent = person.totalXP;
    xpkey2.textContent = 'projects completed:';
    xpval2.textContent = auditData[3];

    xpInfo.appendChild(xpkey1);
    xpInfo.appendChild(xpval1);
    xpInfo.appendChild(xpkey2);
    xpInfo.appendChild(xpval2);

    ProContainer.appendChild(xpInfo);
    gridsContainer.appendChild(ProContainer);


    // third info grid about audits
    const AudContainer = document.createElement('div');
    AudContainer.classList.add('title-and-grid-container');

    const AudTitle = document.createElement('h4');
    AudTitle.textContent = 'Audits Info';
    AudContainer.appendChild(AudTitle);

    const auditInfo = document.createElement('div');
    auditInfo.id = 'audit-info';
    auditInfo.classList.add('key-value-info');

    const auditkey1 = document.createElement('span');
    const auditval1 = document.createElement('span');
    const auditkey2 = document.createElement('span');
    const auditval2 = document.createElement('span');
    const auditkey3 = document.createElement('span');
    const auditval3 = document.createElement('span');
    const auditkey4 = document.createElement('span');
    const auditval4 = document.createElement('span');
    const auditkey5 = document.createElement('span');
    const auditval5 = document.createElement('span');
    const auditkey6 = document.createElement('span');
    const auditval6 = document.createElement('span');

    auditkey1.classList.add('key-text');
    auditkey2.classList.add('key-text');
    auditkey3.classList.add('key-text');
    auditkey4.classList.add('key-text');
    auditkey5.classList.add('key-text');
    auditkey6.classList.add('key-text');

    auditkey1.textContent = 'audits done:';
    auditval1.textContent = personDoneAudits;
    auditkey2.textContent = 'audits received:';
    auditval2.textContent = personReceivedAudits;
    auditkey3.textContent = 'audits ratio:';
    auditval3.textContent = Math.round(person.auditRatio * 1000) / 1000;
    auditkey4.textContent = 'avg group size:';
    auditval4.textContent = Math.round(auditData[1] * 100) / 100;
    auditkey5.textContent = 'avg num of auditors:';
    auditval5.textContent = Math.round(auditData[2] * 100) / 100;
    auditkey6.textContent = 'audit activity ratio:';
    const aar = (personDoneAudits / auditData[1]) / (personReceivedAudits / auditData[2]);
    auditval6.textContent = Math.round(aar * 100) / 100;

    auditInfo.appendChild(auditkey1);
    auditInfo.appendChild(auditval1);
    auditInfo.appendChild(auditkey2);
    auditInfo.appendChild(auditval2);
    auditInfo.appendChild(auditkey3);
    auditInfo.appendChild(auditval3);
    auditInfo.appendChild(auditkey4);
    auditInfo.appendChild(auditval4);
    auditInfo.appendChild(auditkey5);
    auditInfo.appendChild(auditval5);
    auditInfo.appendChild(auditkey6);
    auditInfo.appendChild(auditval6);

    AudContainer.appendChild(auditInfo);
    gridsContainer.appendChild(AudContainer);


    // add grids to container
    personInfoContainer.appendChild(gridsContainer);
    infoBox.appendChild(personInfoContainer);
}

