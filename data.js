import { contentErrorMessage } from "./main.js";
import { auditsDoneQuery, auditsForGroupQuery, groupIdsQuery, userInfoQuery, xpFromTransactionQuery } from "./queries.js";

export function getUserIdFromJWT() {
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    // jwt parts separated by dots: 0 header, 1 payload, 2 signature - Decode payload:
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub; // return x-hasura-user-id from payload
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

export async function getUserData(usrId) {
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

export async function getDoneAuditData(usrId) {
    const data = await runQuery(auditsDoneQuery, usrId);
    const auditsDone = data[Object.keys(data)[0]];
    return auditsDone.length
}

export async function getReceivedAuditData(usrId) {
    const data = await runQuery(groupIdsQuery, usrId);
    let groups = Object.values(data[Object.keys(data)[0]]).map(v => v); // get array of user's groups

    // await for all to resolve with Promise.all (forEach => await will not work) 
    const allAuditData = await Promise.all(
        groups.map(async (group) => {
            const data = await runQuery(auditsForGroupQuery, group.groupId);
            const theseAudits = data[Object.keys(data)[0]];   // array of audit ids for this group
            // audits in piscines can be filtered out by path here, if necessary.
            return theseAudits.length;
        })
    );

    const auditsReceived = allAuditData.reduce((sum, count) => sum + count, 0);
    return auditsReceived;
}

export async function getGraphData(usrId) {
    const data = await runQuery(xpFromTransactionQuery, usrId);
    //console.log(Array.isArray(data.transaction));

    const xp = [];
    data.transaction.forEach(ta => {
        if (
            (!ta.path.includes('piscine-go') && !ta.path.includes('piscine-js')) ||
            ta.path.endsWith('piscine-js')
        ) {
            const time = new Date(ta.createdAt).getTime()
            xp.push({'amount': ta.amount, 'awarded': time})
        }
    });
    return xp;
}