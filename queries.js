export const introspection = `
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
}`

export const me = `
{
  user(where: {id: {_eq: 2587}}) {
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

export const transactions1 = `
{
  transaction(
    where: {
      _and: [
        { userId: { _eq: 2587 } },
        { type: { _eq: "xp" } }
      ]
    }
    order_by: { createdAt: desc }
  ) {
    amount
    createdAt
    type
    path
  }
}`

export const transactions2 = `
{
  transaction(
    where: {
      _and: [
        { userId: { _eq: 2587 } },
        { type: { _eq: "xp" } }
      ]
    }
    order_by: { createdAt: desc }
  ) {
    amount
  }
}`

export const transaction_aggregate= `
{
  transaction_aggregate(
    where: {
      _and: [
        { userId: { _eq: 2587 } },
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
}`