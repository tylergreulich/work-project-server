const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
})

module.exports = {
  User: model('User', UserSchema)
}
