const { gql } = require('apollo-server')

const typeDefs = gql`
  type AuthData {
    user: User
    accessToken: String
  }

  type Error {
    path: String!
    message: String!
  }

  union AuthResult = Error | AuthData

  type User {
    id: String!
    email: String!
    password: String!
    image: String!
  }

  type Query {
    users: [User!]
    me: User
  }

  type Mutation {
    register(email: String!, password: String!, image: String!): AuthResult
    login(email: String!, password: String!): AuthResult
    logout: Boolean!
  }
`

module.exports = { typeDefs }
