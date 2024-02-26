const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const ProcessModel = require('./models/Process');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const axios = require('axios');
const excelToJson = require('convert-excel-to-json');
const nodemailer = require('nodemailer');
const fs = require('fs');

const uploadMiddleware = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
});

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const mongoUrl = "mongodb+srv://adminuser:krintox@cluster0.khivago.mongodb.net/";
// const mongoUrl = "mongodb://localhost:27017";

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

app.post('/post', uploadMiddleware.array('files', 300), async (req, res) => {
  try {
    const { token } = req.cookies;
    
    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title } = req.body;
      const files = req.files || [];

      // Validate title
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      // Handle file uploads
      const postPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.originalname.split('.').pop();
        const newPath = `${file.path}.${fileExtension}`;
        fs.renameSync(file.path, newPath);
        postPhotos.push(newPath);
      }

      // Create new post
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
});

app.put('/post/:id', uploadMiddleware.array('files', 300), async (req, res) => {
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

      // Check if the user is the author of the post
      if (postDoc.author.toString() !== info.id) {
        return res.status(403).json({ message: "You are not the author of this post" });
      }

      // Update title if provided
      if (title) {
        postDoc.title = title;
      }

      // Handle each file
      for (const file of files) {
        const fileExtension = file.originalname.split('.').pop(); // Get the file extension
        const newPath = `${file.path}.${fileExtension}`; // Append the extension to the path
        fs.renameSync(file.path, newPath); // Rename the file with the extension
        postDoc.cover.push(newPath); // Save the file path with extension
      }

      await postDoc.save();

      res.json(postDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fullmovies9205@gmail.com',
    pass: 'yybu djqi koef tynx'
  }
});

// POST endpoint to process excel and image
app.post('/process-excel-and-image', uploadMiddleware.fields([{ name: 'excel', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    // Extract the uploaded files from the request
    const excelFile = req.files['excel'][0];
    const imageFile = req.files['image'][0];

    // Save the input image to the database
    const imagePath = `uploads/${Date.now()}_${imageFile.originalname}`;

    // Call the external API with Excel data and local image file
    const apiResponse = await axios.post('http://external-api-url', {
      excelData: excelFile.buffer,
      image: imageFile.buffer,
    });

    // Extract email array and image data from API response
    const { emailArray, images } = apiResponse.data;

    // Store email array in the database
    // Assuming you have a model named Process to store processed data
    const processDoc = await ProcessModel.create({
      excelData: excelData,
      emailArray,
      imagePath: images, // Storing the image path for future reference
    });

    // Send emails with corresponding images
    for (let i = 0; i < emailArray.length; i++) {
      const mailOptions = {
        from: 'youremail@gmail.com',
        to: emailArray[i],
        subject: 'Processed Image',
        text: 'Please find the processed image attached.',
        attachments: [{
          filename: 'certificate.jpg', // Assuming the image format is JPEG
          content: images[i], // Attach the base64 image directly
        }]
      };

      // Send email
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Emails sent successfully', processDoc });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
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
});

app.post('/sendEmails', (req, res) => {
  try {
    const { subject, content, recipients } = req.body;

    // Check if recipients are provided
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients must be provided as an array' });
    }

    // Iterate over recipients and send email to each one
    for (const recipient of recipients) {
      const mailOptions = {
        from: 'shashanksuggala@yahoo.com',
        to: recipient,
        subject: subject || 'No Subject',
        text: content || 'No Content'
      };

      // Send email
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(4000, () => {
  console.log("Server started at port 4000");
});
