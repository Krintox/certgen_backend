const Profile = require('../models/Profile');
const User = require('../models/User');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

exports.createProfile = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = info.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { firstName, lastName, organizationName, profession } = req.body;
      if (!firstName || !lastName || !organizationName || !profession) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const profile = new Profile({
        firstName,
        lastName,
        organizationName,
        profession,
        profileImage: req.file ? req.file.path : null,
        authorId: userId,
      });
      await profile.save();
      res.json({ message: 'Profile created successfully' });
    });
  } catch (error) {
    console.error('Error in /profile endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, secret, {}, (err, info) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.json(info);
    });
  } catch (error) {
    console.error('Error in /profile endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllProfileInfo = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = info.id;

      // Retrieve user's profile
      const profile = await Profile.findOne({ authorId: userId });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found for this user' });
      }

      // Count total files uploaded by the user
      const totalFiles = profile.files.length;

      // Retrieve user's projects
      const projects = await Project.find({ authorId: userId }, 'title');
      const projectNames = projects.map(project => project.title);

      // Count total projects made by the user
      const totalProjects = projectNames.length;

      // Get user's username
      const user = await User.findById(userId);
      const username = user.username;

      res.json({
        firstName: profile.firstName,
        lastName: profile.lastName,
        organizationName: profile.organizationName,
        profession: profile.profession,
        profileImage: profile.profileImage,
        totalFiles,
        totalProjects,
        projectNames,
        username,
      });
    });
  } catch (error) {
    console.error('Error in /profile/getAll endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
