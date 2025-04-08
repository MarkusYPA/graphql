// 'normal' query: no nesting, no arguments
export const verifyQuery = `{ user { id }}`

// query with nesting
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
    xps {
      amount
      path
    }
      attrs
  }
}`

export const allXpQuery = [`
{
  transaction_aggregate(
    where: {_and: [{type: {_eq: "xp"}}, {eventId: {_eq: 104}}]}
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`]

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
  group(where: {id: {_eq: `,`}}) {
    members_aggregate {
      aggregate {
        count
      }
    }
  }
}`]

export const auditedGroupSizesQuery= `
{
  user {
    audits(where: {auditedAt: {_is_null: false}}) {
      group {
        members_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
}`


// query with arguments
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
