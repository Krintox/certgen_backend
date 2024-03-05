const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  projectId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String },
  imageFile: { type: String },
  excelFile: { type: String },
  arrayOfImages: { type: [String] },
});

module.exports = mongoose.model('Project', projectSchema);
