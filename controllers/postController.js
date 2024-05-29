const Post = require('../models/Post');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = "asdfe45we45w345wegw345werjktjwertkj";

exports.createPost = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { title } = req.body;
      const files = req.files || [];
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      const postPhotos = [];
      for (let file of files) {
        const fileExtension = file.originalname.split('.').pop();
        const newPath = `${file.path}.${fileExtension}`;
        fs.renameSync(file.path, newPath);
        postPhotos.push(newPath);
      }
      const postDoc = await Post.create({
        title,
        cover: postPhotos,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error in /post endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const files = req.files;
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title } = req.body;
    try {
      const postDoc = await Post.findById(postId);
      if (!postDoc) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (postDoc.author.toString() !== info.id) {
        return res.status(403).json({ message: "You are not the author of this post" });
      }
      if (title) {
        postDoc.title = title;
      }
      for (const file of files) {
        const fileExtension = file.originalname.split('.').pop();
        const newPath = `${file.path}.${fileExtension}`;
        fs.renameSync(file.path, newPath);
        postDoc.cover.push(newPath);
      }
      await postDoc.save();
      res.json(postDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

exports.getAllPosts = async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20)
  );
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
};
