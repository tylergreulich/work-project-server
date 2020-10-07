const { gql } = require('apollo-server')

const typeDefs = gql`
  type AuthData {
    user: User
    accessToken: String
    path: String
    message: String
  }

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
    register(email: String!, password: String!, image: String!): AuthData
    login(email: String!, password: String!): AuthData
    logout: Boolean!
  }
`

module.exports = { typeDefs }
