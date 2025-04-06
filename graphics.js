import { roundToOneSignificantNumber } from "./calculations.js";
import { getDoneAuditData, getGraphData, getReceivedAuditData, getUserData, getUserIdFromJWT } from "./data.js";
import { dataContainer, numberOfColumns } from "./main.js";


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

    dataContainer.prepend(infoBox);
}

export async function drawGraph() {
    const userId = getUserIdFromJWT();
    const graphData = await getGraphData(userId);

    //const svgWidth = dataContainer.clientWidth || 800;
    const padding = 40;
    const leftPadding = 90; // more room for y label
    const svgWidth = 800;
    const svgHeight = 400; // keep a fixed height for now

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = 'chart';
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); // optional but helpful
    svg.style.width = "100%";
    svg.style.height = "auto";

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

    dataContainer.appendChild(svg);
}