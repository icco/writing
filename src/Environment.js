const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime')
// Here you instantiate the required Store that will store the cached data.
const store = new Store(new RecordSource())
// Now you create a Network that knows your GraphQL server from before, it's
// instantiated with a function that returns a Promise of a networking call to
// the GraphQL API - here that's done using fetch.
const network = Network.create((operation, variables) => {
  return fetch('https://writing-be.natwelch.com/graphql', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json()
  })
})
// With the store and network available you can instantiate the actual
// Environment.
const environment = new Environment({
  network,
  store,
})

export default environment
