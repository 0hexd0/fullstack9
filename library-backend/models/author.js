const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  born: Number,
})

module.exports = mongoose.model('Author', authorSchema)
