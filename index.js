const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const uploadMiddleware = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB per file
});
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const mongoUrl = "mongodb+srv://adminuser:krintox@cluster0.khivago.mongodb.net/";

mongoose.connect(mongoUrl, {
    useNewUrlParser:true
}).then(() => {console.log("Connected to database");
})
.catch((e)=>console.log(e));

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});



app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.array('files', 300), async (req,res) => {
  const files = req.files;
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title} = req.body;
    const postPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const newPath = files[i].path;
      postPhotos.push(newPath);
    }
    const postDoc = await Post.create({
      title,
      cover: postPhotos,
      author: info.id,
    });
    res.json(postDoc);
  });
});


app.put('/post', uploadMiddleware.array('files', 300), async (req, res) => {
  const files = req.files; // Array of uploaded files
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;

    const { id, title } = req.body;

    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }

    // Update post fields
    postDoc.title = title;

    // Handle each file
    for (const file of files) {
      const newPath = file.path + '.' + file.originalname.split('.').pop();
      fs.renameSync(file.path, newPath);
      postDoc.cover = newPath; // Update cover image path
    }

    // Save the updated post
    await postDoc.save();

    res.json(postDoc);
  });
});


app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.listen(4000, () => {
  console.log("Server started at port 4000");
});