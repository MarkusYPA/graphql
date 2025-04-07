import { contentErrorMessage } from "../controller.js";
import { auditsDoneQuery, auditsForGroupQuery, groupIdsQuery, groupMembersQuery, skillsFromTransactionsQuery, userInfoQuery, verifyQuery, xpFromTransactionQuery } from "./queries.js";

export async function getJWT(credentials) {
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
            return [true, data];
        } else {
            return [false, data.error];
        }
    } catch (error) {
        return [false, error];
    }
}

// Check that the stored jwt is valid
export async function verifyJWT() {
    const token = localStorage.getItem("gritlabGraphQLjwt");
    if (!token) return false;

    try {
        const res = await fetch("https://01.gritlab.ax/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query: verifyQuery })
        });
        return res.ok;
    } catch (error) {
        console.error("Login request failed:", error);
        loginErrorMessage.textContent = "Login not allowed from this location";
        return false;
    }
}

export function getUserIdFromJWT() {
    const token = localStorage.getItem("gritlabGraphQLjwt");
    if (!token) return null;

    // jwt parts separated by dots: 0 header, 1 payload, 2 signature - Decode payload:
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub; // return x-hasura-user-id from payload
}

async function runQuery(queryArg) {
    const token = localStorage.getItem("gritlabGraphQLjwt");

    try {
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

export async function getUserData() {
    const data = await runQuery(userInfoQuery);
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

export async function getDoneAuditData(usrId) {
    const data = await runQuery(auditsDoneQuery[0] + usrId + auditsDoneQuery[1]);
    const auditsDone = data[Object.keys(data)[0]];
    return auditsDone.length
}

export async function getReceivedAuditData(usrId) {
    const data = await runQuery(groupIdsQuery[0] + usrId + groupIdsQuery[1]);
    let groups = Object.values(data[Object.keys(data)[0]]).map(v => v); // get array of user's groups

    // Count all audits for each group
    // await for all to resolve with Promise.all (forEach => await will not work) 
    let unfinishedGroups = [];
    const allAuditData = await Promise.all(
        groups.map(async (group) => {
            const data = await runQuery(auditsForGroupQuery[0] + group.groupId + auditsForGroupQuery[1]);
            const theseAudits = data[Object.keys(data)[0]];   // array of audit ids for this group
            // Raid audits in piscines can be filtered out by path here, if necessary.
            if (theseAudits.length == 0) unfinishedGroups.push(group.groupId);
            return theseAudits.length;
        })
    );

    const auditsReceived = allAuditData.reduce((sum, count) => sum + count, 0);

    let groupSizes = await Promise.all(
        groups.map(async (group) => {
            if (unfinishedGroups.includes(group.groupId)) return null;
            const data = await runQuery(groupMembersQuery[0] + group.groupId + groupMembersQuery[1]);
            const layer1 = data[Object.keys(data)[0]];
            const members = layer1[Object.keys(layer1)[0]]['members'];
            return members.length;
        })
    );
    groupSizes = groupSizes.filter((size) => size !== null);

    const avgGroupSize = groupSizes.reduce((sum, count) => sum + count, 0) / groupSizes.length;
    const avgAuditorAmount = allAuditData.reduce((sum, count) => sum + count, 0) / groupSizes.length;

    return [auditsReceived, avgGroupSize, avgAuditorAmount, groupSizes.length];
}

export async function getGraphData(usrId) {
    const data = await runQuery(xpFromTransactionQuery[0] + usrId + xpFromTransactionQuery[1]);

    const xp = [];
    data.transaction.forEach(ta => {
        if (
            (!ta.path.includes('piscine-go') && !ta.path.includes('piscine-js')) ||
            ta.path.endsWith('piscine-js')
        ) {
            const time = new Date(ta.createdAt).getTime()
            xp.push({ 'amount': ta.amount, 'awarded': time })
        }
    });
    return xp;
}

export async function getSkillsData() {
    const data = await runQuery(skillsFromTransactionsQuery);
    const skills = data.user[0].skills.sort((a, b) => b.amount - a.amount)
    return skills;
}