const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photos: [
    {
      imageId: { type: String, required: true },
      imageUrl: { type: String, required: true },
    }
  ],
  coverImage: { type: String, default: null }, // Optional cover image link
  excelFile: { type: String, default: null },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
