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

    // Ensure that each photo has both imageId and imageUrl
    const newPhotosArray = photos.map((photo, index) => {
      if (!photo.imageId || !photo.imageUrl) {
        throw new Error('Each photo must have both imageId and imageUrl');
      }
      return {
        imageId: photo.imageId,
        imageUrl: photo.imageUrl,
      };
    });

    project.photos = project.photos.concat(newPhotosArray);
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

    if (!photo || !photo.imageUrl || !photo.imageId) {
      return res.status(400).json({ message: 'Image link and image ID must be provided' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.photos.push({ imageId: photo.imageId, imageUrl: photo.imageUrl });
    await project.save();
    res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadImage endpoint:', error);
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
      const project = await Project.find({ authorId });
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

exports.getUserProjectImages = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const authorId = info.id;
      const projects = await Project.find({ authorId });

      const images = projects.map(project => ({
        projectId: project._id,
        images: project.photos.map(photo => ({
          imageId: photo.imageId,
          imageUrl: photo.imageUrl
        }))
      }));

      res.json(images);
    });
  } catch (error) {
    console.error('Error in getUserProjectImages endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const { imageId } = req.params;
    const project = await Project.findOne({ 'photos.imageId': imageId });

    if (!project) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const photo = project.photos.find(photo => photo.imageId === imageId);
    res.json({ imageUrl: photo.imageUrl });
  } catch (error) {
    console.error('Error in getImageById endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
