import { barChartContainer, lineChartContainer } from "../controller.js";
import { roundToOneSignificantNumber } from "../utils/calculations.js";

export async function xpGraph(graphData) {

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
    const leftPadding = 100; // more room for y label
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
    const maxTime = Date.now();
    const minAmount = 0;
    const maxAmount = Math.max(...amountsAcc);

    const xScale = time =>
        leftPadding + ((time - minTime) / (maxTime - minTime)) * (svgWidth - leftPadding - padding);

    const yScale = amount =>
        svgHeight - padding - ((amount - minAmount) / (maxAmount - minAmount)) * (svgHeight - 2 * padding);


    // Draw these first so graph goes over lines
    drawTicksAndLabels();

    // determine points of graph line
    let points = [];
    for (let i = 0; i < graphData.length; i++) {
        // Point where xp was awarded
        const x = xScale(times[i]);
        const y = yScale(amountsAcc[i]);
        points.push(`${x},${y}`);

        // Second point to extend line horizontally
        let xFlat = 0;
        if (i + 1 < graphData.length) {
            xFlat = xScale(times[i + 1]);
        } else {
            xFlat = xScale(Date.now());
        }
        points.push(`${xFlat},${y}`);
    }

    // Create graph line
    const pathData = "M " + points.join(" L ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("chart-line");
    path.setAttribute("d", pathData);
    svg.appendChild(path);


    const tooltip = document.getElementById("tooltip");

    // make little circles at xp points
    for (let i = 0; i < graphData.length; i++) {
        const cx = xScale(times[i]);
        const cy = yScale(amountsAcc[i]);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 2.5); // radius
        circle.classList.add('data-tick');

        circle.addEventListener("mouseover", e => {
            tooltip.style.display = "block";
            //tooltip.style.opacity = "1";
            tooltip.innerText = graphData[i].project;
        });

        circle.addEventListener("mousemove", e => {
            tooltip.style.left = e.pageX - 25 + "px";
            tooltip.style.top = e.pageY - 35 + "px";
        });

        circle.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
            //tooltip.style.opacity = "0";
        });

        svg.appendChild(circle);
    }


    // Axis lines
    const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxisLine.setAttribute("x1", leftPadding);
    xAxisLine.setAttribute("y1", svgHeight - padding);
    xAxisLine.setAttribute("x2", svgWidth - padding);
    xAxisLine.setAttribute("y2", svgHeight - padding);
    xAxisLine.classList.add('axis-line');
    svg.appendChild(xAxisLine);

    const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxisLine.setAttribute("x1", leftPadding);
    yAxisLine.setAttribute("y1", svgHeight - padding);
    yAxisLine.setAttribute("x2", leftPadding);
    yAxisLine.setAttribute("y2", padding);
    yAxisLine.classList.add('axis-line');
    svg.appendChild(yAxisLine);


    // Make ticks and labels for the axes
    function drawTicksAndLabels() {
        const numTicks = 5;
        const xTickValues = [];
        const yTickValues = [];
        const yTickStep = roundToOneSignificantNumber(maxAmount / 5);

        for (let i = 0; i <= numTicks; i++) {
            const t = minTime + ((maxTime - minTime) / numTicks) * i;
            xTickValues.push(new Date(t));
        }

        let newYTick = 0;
        while (newYTick <= maxAmount - yTickStep) {
            newYTick += yTickStep;
            yTickValues.push(newYTick);
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
            tick.classList.add('axis-tick');
            svg.appendChild(tick);

            // Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", svgHeight - padding + 27);
            label.setAttribute("text-anchor", "middle");
            label.classList.add("tick-label");
            label.textContent = date.toLocaleDateString("fi-FI");
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
            tick.classList.add('axis-tick');
            svg.appendChild(tick);

            // Grid line
            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", leftPadding);
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("x2", svgWidth - padding);
            gridLine.setAttribute("y2", y);
            gridLine.classList.add('grid-line');
            svg.appendChild(gridLine);

            // Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", leftPadding - 10);
            label.setAttribute("y", y + 4);
            label.setAttribute("text-anchor", "end");
            label.classList.add("tick-label");
            label.textContent = amount.toLocaleString('fi-FI'); // spaces every three digits
            svg.appendChild(label);
        });


        // X-axis label
        /*         const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                xAxisLabel.setAttribute("x", svgWidth / 2);
                xAxisLabel.setAttribute("y", svgHeight);
                xAxisLabel.setAttribute("text-anchor", "middle");
                xAxisLabel.classList.add("axis-label");
                xAxisLabel.textContent = "Date";
                svg.appendChild(xAxisLabel); */

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

export async function skillsGraph(skills) {
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
    const leftPadding = 70;
    const bottomPadding = 90; // more room for labels
    const barWidth = ((svgWidth - padding - leftPadding) / skills.length) * (3 / 4);
    const barGap = ((svgWidth - padding - leftPadding) / skills.length) * (1 / 4);

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
        xLabel.setAttribute("transform", `rotate(-45 ${x + barWidth / 2} ${yLocation})`);
        xLabel.textContent = skillLabel;
        xLabel.classList.add("axis-label");
        svg.appendChild(xLabel);
    });

    // Axis lines
    const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxisLine.setAttribute("x1", leftPadding - barGap);
    xAxisLine.setAttribute("y1", svgHeight - bottomPadding);
    xAxisLine.setAttribute("x2", svgWidth - padding);
    xAxisLine.setAttribute("y2", svgHeight - bottomPadding);
    xAxisLine.classList.add('axis-line');
    svg.appendChild(xAxisLine);

    const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxisLine.setAttribute("x1", leftPadding - barGap);
    yAxisLine.setAttribute("y1", svgHeight - bottomPadding);
    yAxisLine.setAttribute("x2", leftPadding - barGap);
    yAxisLine.setAttribute("y2", padding);
    yAxisLine.classList.add('axis-line');
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
        tick.classList.add('axis-tick');
        svg.appendChild(tick);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", leftPadding - (15 + barGap));
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.classList.add("tick-label");
        label.textContent = `${value}%`;
        svg.appendChild(label);
    }

    chartInfoContainer.appendChild(svg);
    barChartContainer.appendChild(chartInfoContainer);
}
