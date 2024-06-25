const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const secret = "asdfe45we45w345wegw345werjktjwertkj";

exports.createProject = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { title, description, photos } = req.body;
      const authorId = info.id;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const project = new Project({
        title,
        description,
        photos: photos || [], // Save the array of image links
        authorId,
      });
      await project.save();
      res.json({ message: 'Project created successfully', projectId: project._id });
    });
  } catch (error) {
    console.error('Error in createProject endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { photos } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: 'No image links provided' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.photos = project.photos.concat(photos);
    await project.save();
    res.json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadImages endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { photo } = req.body;

    if (!photo) {
      return res.status(400).json({ message: 'No image link provided' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.photos.push(photo);
    await project.save();
    res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadImage endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadExcel = async (req, res) => {
  try {
    const { projectId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fileExtension = file.originalname.split('.').pop();
    const newPath = `${file.path}.${fileExtension}`;
    fs.renameSync(file.path, newPath);

    project.excelFile = newPath;
    await project.save();
    res.json({ message: 'Excel file uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadExcel endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const authorId = info.id;
      const project = await Project.findOne({ authorId });
      if (!project) {
        return res.status(404).json({ message: 'Project not found for this user' });
      }
      res.json(project);
    });
  } catch (error) {
    console.error('Error in getProject endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error in getProjectById endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
