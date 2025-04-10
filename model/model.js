import { contentErrorMessage, loginErrorMessage } from "../controller.js";
import { auditedGroupSizesQuery, auditsDoneQuery, auditsForGroupQuery, groupIdsQuery, groupMembersQuery, skillsFromTransactionsQuery, userInfoQuery, verifyQuery, xpFromTransactionQuery } from "./queries.js";

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
        return [false, "Login not allowed from this location"];
    }
}

// Check that the stored jwt is valid
export async function verifyJWT() {
    const token = localStorage.getItem("jwt");
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
        const data = await res.json();
        if (data.errors) {
            console.error("Error verifying jwt:", data.errors[0].message);
            loginErrorMessage.textContent = data.errors[0].message;
            return false;
        }

        return res.ok;
    } catch (error) {
        console.error("Login request failed:", error);
        loginErrorMessage.textContent = "Login not allowed from this location";
        return false;
    }
}

export function getUserIdFromJWT() {
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    // jwt parts separated by dots: 0 header, 1 payload, 2 signature - Decode payload:
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub; // return x-hasura-user-id from payload
}

async function runQuery(queryArg) {
    const token = localStorage.getItem("jwt");

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

    let ownGroupSizes = await Promise.all(
        groups.map(async (group) => {
            if (unfinishedGroups.includes(group.groupId)) return null;
            const data = await runQuery(groupMembersQuery[0] + group.groupId + groupMembersQuery[1]);
            return data.group[0].members_aggregate.aggregate.count;
        })
    );
    ownGroupSizes = ownGroupSizes.filter((size) => size !== null);

    const auditedGroupSizes = await runQuery(auditedGroupSizesQuery);    
    let auditedGroups = auditedGroupSizes.user[0].audits;
    auditedGroups = auditedGroups.map((gr)=> gr.group.members_aggregate.aggregate.count)

    const auditsReceived = allAuditData.reduce((sum, count) => sum + count, 0);
    const avgOwnGroupSize = ownGroupSizes.reduce((sum, count) => sum + count, 0) / ownGroupSizes.length;
    const avgAuditorAmount = allAuditData.reduce((sum, count) => sum + count, 0) / ownGroupSizes.length;
    const avgAuditeesAmount = auditedGroups.reduce((sum, count) => sum + count, 0) / auditedGroups.length;

    return [auditsReceived, avgOwnGroupSize, avgAuditorAmount, ownGroupSizes.length, avgAuditeesAmount];
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
            const project = String(ta.path).split(`/`).pop();
            xp.push({ 'amount': ta.amount, 'awarded': time, 'project': project})
        }
    });
    return xp;
}

export async function getSkillsData() {
    const data = await runQuery(skillsFromTransactionsQuery);
    const skills = data.user[0].skills.sort((a, b) => b.amount - a.amount)
    return skills;
}