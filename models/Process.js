const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProcessSchema = new Schema({
  excelData: Object, // Change the type as per your Excel data structure
  emailArray: [String],
  imagePath: [String], // Path to the stored image file
}, {
  timestamps: true,
});

const ProcessModel = model('Process', ProcessSchema);

module.exports = ProcessModel;
