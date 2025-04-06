export const userInfoQuery = `
{
  user {
    id
    firstName
    lastName
    login
    campus
    auditRatio
    totalUp
    totalDown
    xps(order_by: {event: {createdAt: desc}}) {
      amount
      path
    }
  }
}`


export const auditsDoneQuery = [`
{
  audit(where: {_and: [{auditorId: {_eq: `, `}}, {auditedAt: {_is_null: false}}]}) {
    id
  }
}`]

export const groupIdsQuery = [`
{
  group_user(where: {userId: {_eq: `, `}}) {
    groupId
    path
  }
}`]

export const auditsForGroupQuery = [`
{
  audit(where: {_and: [{groupId: {_eq: `, `}}, {auditedAt: {_is_null: false}}]}) {
    id
  }
}`]

export const groupMembersQuery = [`
{
  group(where: {id: {_eq: `, `}}) {
    members {
      userId
    }
  }
}`]

export const xpFromTransactionQuery = [`
{
  transaction(
    where: {_and: [{userId: {_eq: `, `}}, {type: {_eq: "xp"}}]}
    order_by: {createdAt: asc}
  ) {
    amount
    createdAt
    path
  }
}`]

export const skillsFromTransactionsQuery = `
{
  user {
    skills: transactions(
      order_by: [{type: desc}, {amount: desc}]
      distinct_on: [type]
      where: {type: {_like: "skill%"}}
    ) {
      type
      amount
    }
  }
}`





export const introspectionQuery = `
{
  __schema {
    types {
            name
            kind
      fields {
                name
            }
        }
    }
} `

export const transactions2 = [`
{
    transaction(
        where: {
        _and: [
            { userId: { _eq: `, ` } },
            { type: { _eq: "xp" } }
        ]
    }
    order_by: { createdAt: desc }
    ) {
        amount
    }
} `]

export const transaction_aggregate = [`
{
    transaction_aggregate(
        where: {
        _and: [
            { userId: { _eq: `, ` } },
            { type: { _eq: "xp" } }
        ]
    }
    ) {
    aggregate {
      sum {
                amount
            }
        }
    }
} `]