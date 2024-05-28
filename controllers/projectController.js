const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const secret = process.env.JWT_SECRET;
const { ValidationError } = require('mongoose').Error;

exports.createProject = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { title, description } = req.body;
      const authorId = info.id;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const project = new Project({
        title,
        description,
        authorId,
      });
      await project.save();
      res.json({ message: 'Project created successfully', projectId: project._id });
    });
  } catch (error) {
    console.error('Error in createProject endpoint:', error);

    if (error instanceof ValidationError) {
      const errorMessages = Object.values(error.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectPhotos = [];
    for (let file of files) {
      const fileExtension = file.originalname.split('.').pop();
      const newPath = `${file.path}.${fileExtension}`;
      fs.renameSync(file.path, newPath);
      projectPhotos.push(newPath);
    }

    project.photos = project.photos.concat(projectPhotos);
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

    project.coverImage = newPath;
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
