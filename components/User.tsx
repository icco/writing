import { gql } from "@apollo/client"

export const getUser = gql`
  query getUser {
    whoami {
      id
      name
      role
    }
  }
`
