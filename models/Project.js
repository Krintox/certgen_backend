// models/Project.js

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  excelFile: {
    type: String,
    required: true
  },
  imageFile: {
    type: String,
    required: true
  },
  arrayOfImages: [{
    type: String,
    required: true
  }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
