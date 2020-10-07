const { User } = require('./models/User.model')
const { sendRefreshToken } = require('./sendRefreshToken')
const { createAccessToken, createRefreshToken } = require('./auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { verify } = require('jsonwebtoken')

const resolvers = {
  Query: {
    users: () => User.find(),
    me: async (_, __, { req, res }) => {
      const authorization = req.headers['authorization']

      if (!authorization) {
        return null
      }

      try {
        const token = authorization.split(' ')[1]
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET)
        return User.findById(payload.userId)
      } catch (err) {
        console.log(err)
        return null
      }
    }
  },
  Mutation: {
    register: async (_, { email, password, image }) => {
      const hashedPassword = await bcrypt.hash(password, 10)
      await new User({
        email,
        password: hashedPassword,
        image
      }).save()
      return true
    },
    login: async (_, { email, password }, { req, res }) => {
      console.log('login running')
      const user = await User.findOne({ email })

      if (!user) return false

      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) return false

      sendRefreshToken(res, createRefreshToken(user))

      console.log('returning payload')
      return {
        accessToken: createAccessToken(user),
        user
      }
    },
    logout: (_, __, { res }) => {
      sendRefreshToken(res, '')
      return true
    }
  }
}

module.exports = { resolvers }
