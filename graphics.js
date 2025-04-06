import { roundToOneSignificantNumber } from "./calculations.js";
import { getDoneAuditData, getGraphData, getReceivedAuditData, getSkillsData, getUserData, getUserIdFromJWT } from "./data.js";
import { barChartContainer, infoBox, lineChartContainer, numberOfColumns } from "./main.js";


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


export async function fillUserInfo() {
    const userId = getUserIdFromJWT();
    const person = await getUserData();
    const personDoneAudits = await getDoneAuditData(userId);
    const auditData = await getReceivedAuditData(userId);
    const personReceivedAudits = auditData[0];

    //const infoBox = document.querySelector('#personal-info');

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
    const personalInfo = document.createElement('div');
    personalInfo.id = 'personal-info';
    personalInfo.classList.add('key-value-info');

    const key1 = document.createElement('span');
    const val1 = document.createElement('span');
    const key2 = document.createElement('span');
    const val2 = document.createElement('span');
    const key3 = document.createElement('span');
    const val3 = document.createElement('span');

    key1.textContent = 'id number:';
    val1.textContent = person.id;
    key2.textContent = 'username:';
    val2.textContent = person.login;
    key3.textContent = 'experience points:';
    val3.textContent = person.totalXP;

    personalInfo.appendChild(key1);
    personalInfo.appendChild(val1);
    personalInfo.appendChild(key2);
    personalInfo.appendChild(val2);
    personalInfo.appendChild(key3);
    personalInfo.appendChild(val3);

    gridsContainer.appendChild(personalInfo);

    // second info grid about audits
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

    gridsContainer.appendChild(auditInfo);


    // add grids to container
    personInfoContainer.appendChild(gridsContainer);
    infoBox.appendChild(personInfoContainer);
}


export async function xpGraph() {
    const userId = getUserIdFromJWT();
    const graphData = await getGraphData(userId);

    // container for chart (deals with borders)
    //const chartContainer = document.querySelector('#line-chart');

    // container for chart info (deals with layout)
    const chartInfoContainer = document.createElement('div');
    chartInfoContainer.classList.add('chart-info-container');
    chartInfoContainer.classList.add('key-value-title');

    // title with user names
    const titleRow = document.createElement('h3');
    titleRow.textContent = 'XP progression over time';
    chartInfoContainer.appendChild(titleRow);

    //const svgWidth = dataContainer.clientWidth || 800;
    const padding = 40;
    const leftPadding = 90; // more room for y label
    const svgWidth = 800;
    const svgHeight = 400;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add('chart');
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); // optional but helpful

    const times = graphData.map(d => d.awarded);
    const amountsSeparate = graphData.map(d => d.amount);
    const amountsAcc = amountsSeparate.map((_, i) => amountsSeparate.slice(0, i + 1).reduce((sum, curr) => sum + curr));

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const minAmount = 0;
    const maxAmount = Math.max(...amountsAcc);

    const xScale = time =>
        leftPadding + ((time - minTime) / (maxTime - minTime)) * (svgWidth - leftPadding - padding);

    const yScale = amount =>
        svgHeight - padding - ((amount - minAmount) / (maxAmount - minAmount)) * (svgHeight - 2 * padding);


    let points = [];
    for (let i = 0; i < graphData.length; i++) {
        const x = xScale(times[i]);
        const y = yScale(amountsAcc[i]);
        points.push(`${x},${y}`);
    }

    const pathData = "M " + points.join(" L ");

    drawTicksAndLabels();

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("chart-line");
    path.setAttribute("d", pathData);
    svg.appendChild(path);

    for (let i = 0; i < graphData.length; i++) {
        const x = xScale(times[i]);
        const y = yScale(amountsAcc[i]);
        points.push(`${x},${y}`);

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", y - 6);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", y);
        tick.classList.add("data-tick");
        svg.appendChild(tick);
    }

    // Axis lines
    const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxisLine.setAttribute("x1", leftPadding);
    xAxisLine.setAttribute("y1", svgHeight - padding);
    xAxisLine.setAttribute("x2", svgWidth - padding);
    xAxisLine.setAttribute("y2", svgHeight - padding);
    xAxisLine.setAttribute("stroke", "black");
    svg.appendChild(xAxisLine);

    const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxisLine.setAttribute("x1", leftPadding);
    yAxisLine.setAttribute("y1", svgHeight - padding);
    yAxisLine.setAttribute("x2", leftPadding);
    yAxisLine.setAttribute("y2", padding);
    yAxisLine.setAttribute("stroke", "black");
    svg.appendChild(yAxisLine);


    // Make ticks and labels for the axes
    function drawTicksAndLabels() {
        const numTicks = 5;
        const xTickValues = [];
        const yTickValues = [];
        const roundedMax = roundToOneSignificantNumber(maxAmount);

        for (let i = 0; i <= numTicks; i++) {
            const t = minTime + ((maxTime - minTime) / numTicks) * i;
            xTickValues.push(new Date(t));

            const a = minAmount + ((roundedMax - minAmount) / numTicks) * i;
            yTickValues.push(a);
        }

        // X-axis ticks & labels
        xTickValues.forEach(date => {
            const x = xScale(date.getTime());

            // Tick line
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("y1", svgHeight - padding);
            tick.setAttribute("x2", x);
            tick.setAttribute("y2", svgHeight - padding + 5);
            tick.setAttribute("stroke", "black");
            svg.appendChild(tick);

            // Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", svgHeight - padding + 20);
            label.setAttribute("text-anchor", "middle");
            label.classList.add("tick-label");
            label.textContent = date.toLocaleDateString("sv-SE"); // or "en-GB", etc.
            svg.appendChild(label);
        });

        // Y-axis ticks & labels
        yTickValues.forEach(amount => {
            const y = yScale(amount);

            // Tick line
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", leftPadding - 5);
            tick.setAttribute("y1", y);
            tick.setAttribute("x2", leftPadding);
            tick.setAttribute("y2", y);
            tick.setAttribute("stroke", "black");
            svg.appendChild(tick);

            // Grid line
            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", leftPadding);
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("x2", svgWidth - padding);
            gridLine.setAttribute("y2", y);
            gridLine.setAttribute("stroke", "grey");
            svg.appendChild(gridLine);

            // Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", leftPadding - 10);
            label.setAttribute("y", y + 4);
            label.setAttribute("text-anchor", "end");
            label.classList.add("tick-label");
            label.textContent = amount.toLocaleString(); // e.g. 1,000
            svg.appendChild(label);
        });


        // X-axis label
        const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xAxisLabel.setAttribute("x", svgWidth / 2);
        xAxisLabel.setAttribute("y", svgHeight);
        xAxisLabel.setAttribute("text-anchor", "middle");
        xAxisLabel.classList.add("axis-label");
        xAxisLabel.textContent = "Date";
        svg.appendChild(xAxisLabel);

        // Y-axis label
        const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yAxisLabel.setAttribute("x", 15);
        yAxisLabel.setAttribute("y", svgHeight / 2);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.classList.add("axis-label");
        yAxisLabel.setAttribute("transform", `rotate(-90 15 ${svgHeight / 2})`);
        yAxisLabel.textContent = "Experience Points";
        svg.appendChild(yAxisLabel);
    }

    chartInfoContainer.appendChild(svg);
    lineChartContainer.appendChild(chartInfoContainer);
}

export async function skillsGraph() {
    const skills = await getSkillsData();

    // container for chart (deals with borders)
    //const chartContainer = document.querySelector('#bar-chart');

    // container for chart info (deals with layout)
    const chartInfoContainer = document.createElement('div');
    chartInfoContainer.classList.add('chart-info-container');
    chartInfoContainer.classList.add('key-value-title');

    // title with user names
    const titleRow = document.createElement('h3');
    titleRow.textContent = 'Acquired Skills';
    chartInfoContainer.appendChild(titleRow);

    const svgWidth = 800;
    const svgHeight = 400;
    const padding = 40;
    const leftPadding = 90; // more room for y label
    const bottomPadding = 90; // more room for y label

    const r = 2; // bar-to-gap width ratio
    const gaps = skills.length - 1;
    const barGap = svgWidth / (gaps * r + gaps + r);    // formula for gap width
    const barWidth = barGap * r;

    const chartHeight = svgHeight - (padding + bottomPadding);
    const maxAmount = 100;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add('chart');
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); // optional but helpful

    // Y-axis scale
    const yScale = (amount) =>
        chartHeight - (amount / maxAmount) * chartHeight + padding;

    // Draw bars
    skills.forEach((entry, index) => {
        const x = leftPadding + index * (barWidth + barGap);
        const skillLabel = entry.type.replace("skill_", "");

        const backgroundBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        backgroundBar.setAttribute("x", x);
        backgroundBar.setAttribute("y", yScale(100));
        backgroundBar.setAttribute("width", barWidth);
        backgroundBar.setAttribute("height", chartHeight);
        backgroundBar.classList.add('background-bar');
        svg.appendChild(backgroundBar);

        const foregroundBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        foregroundBar.setAttribute("x", x);
        foregroundBar.setAttribute("y", yScale(entry.amount));
        foregroundBar.setAttribute("width", barWidth);
        foregroundBar.setAttribute("height", (entry.amount / maxAmount) * chartHeight);
        foregroundBar.classList.add('foreground-bar');
        svg.appendChild(foregroundBar);

        // Value label
        const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valueLabel.setAttribute("x", x + barWidth / 2);
        valueLabel.setAttribute("y", yScale(entry.amount) - 5);
        valueLabel.setAttribute("text-anchor", "middle");
        valueLabel.classList.add("tick-label");
        valueLabel.textContent = `${entry.amount}%`;
        svg.appendChild(valueLabel);

        // X-axis label
        const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xLabel.setAttribute("x", x + barWidth / 2);
        const yLocation = svgHeight - bottomPadding * 0.7;
        xLabel.setAttribute("y", yLocation);
        xLabel.setAttribute("text-anchor", "end");
        xLabel.setAttribute("font-size", "10");
        xLabel.setAttribute("transform", `rotate(-45 ${x + barWidth / 2} ${yLocation})`);
        xLabel.textContent = skillLabel;
        xLabel.classList.add("axis-label");
        svg.appendChild(xLabel);
    });

    // Axis lines
    const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxisLine.setAttribute("x1", leftPadding - barGap);
    xAxisLine.setAttribute("y1", svgHeight - bottomPadding);
    xAxisLine.setAttribute("x2", svgWidth - padding + barWidth + barGap);
    xAxisLine.setAttribute("y2", svgHeight - bottomPadding);
    xAxisLine.setAttribute("stroke", "black");
    svg.appendChild(xAxisLine);

    const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxisLine.setAttribute("x1", leftPadding - barGap);
    yAxisLine.setAttribute("y1", svgHeight - bottomPadding);
    yAxisLine.setAttribute("x2", leftPadding - barGap);
    yAxisLine.setAttribute("y2", padding);
    yAxisLine.setAttribute("stroke", "black");
    svg.appendChild(yAxisLine);

    // Y-axis ticks
    for (let i = 0; i <= 5; i++) {
        const value = i * 20;
        const y = yScale(value);

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", leftPadding - (10 + barGap));
        tick.setAttribute("x2", leftPadding - barGap);
        tick.setAttribute("y1", y);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "#333");
        svg.appendChild(tick);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", leftPadding - (15 + barGap));
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.classList.add("tick-label");
        label.textContent = `${value}%`;
        svg.appendChild(label);
    }

    // Y Axis label
    const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yAxisLabel.setAttribute("x", 30);
    yAxisLabel.setAttribute("y", svgHeight / 2);
    yAxisLabel.setAttribute("text-anchor", "middle");
    yAxisLabel.setAttribute("font-size", "12");
    yAxisLabel.setAttribute("transform", `rotate(-90 15 ${svgHeight / 2})`);
    yAxisLabel.textContent = "Skill Level (%)";
    svg.appendChild(yAxisLabel);

    chartInfoContainer.appendChild(svg);
    barChartContainer.appendChild(chartInfoContainer);
}