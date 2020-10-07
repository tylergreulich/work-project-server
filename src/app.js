const { ApolloServer, gql } = require('apollo-server-express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { resolvers } = require('./resolvers')
const { typeDefs } = require('./typeDefs')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { sendRefreshToken } = require('./sendRefreshToken')
const { createAccessToken, createRefreshToken } = require('./auth')
const { verify } = require('jsonwebtoken')
const { User } = require('./models/User.model')
dotenv.config()

const connectToDb = async () => {
  return mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch((error) => console.error({ error }))
}

const startServer = async () => {
  await connectToDb()

  const app = express()

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  )
  app.use(cookieParser())
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid
    if (!token) {
      return res.send({ ok: false, accessToken: '' })
    }

    let payload = null
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
      console.log(err)
      return res.send({ ok: false, accessToken: '' })
    }

    // token is valid and
    // we can send back an access token
    const user = await User.findById(payload.userId)

    if (!user) {
      return res.send({ ok: false, accessToken: '' })
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' })
    }

    sendRefreshToken(res, createRefreshToken(user))

    return res.send({ ok: true, accessToken: createAccessToken(user) })
  })

  const server = new ApolloServer({
    resolvers,
    typeDefs,
    context: ({ req, res }) => ({
      req,
      res
    })
  })

  server.applyMiddleware({ app, cors: false })

  const port = process.env.PORT || 4000

  app.listen(port, () => {
    console.log(`Server listening on Port ${port}`)
  })
}

module.exports = { startServer }
