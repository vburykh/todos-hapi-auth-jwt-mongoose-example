'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Todo Schema
 */
var TodoSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    trim: true,
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  },
  created: {
    type: Number,
    required: true
  }
});


module.exports = mongoose.model('todo', TodoSchema);
