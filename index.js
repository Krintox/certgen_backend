const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const Project = require('./models/Project');
const Profile = require('./models/Profile')
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const axios = require('axios');
const excelToJson = require('convert-excel-to-json');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');

const uploadMiddleware = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

// Multer storage configuration for project-related file uploads
const projectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Destination based on file type
    if (file.fieldname === 'excelFile') {
      cb(null, './uploads/excel');
    } else if (file.fieldname === 'imageFile') {
      cb(null, './uploads/images');
    } else if (file.fieldname === 'arrayOfImages') {
      cb(null, './uploads/arrayImages');
    } else {
      cb(null, './uploads'); // Default destination
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});
const upload = multer({ storage: storage });
const projectUpload = multer({ storage: projectStorage });


const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = ['http://localhost:3000','http://localhost:3001', 'https://certgen-frontend.vercel.app', 'certgen-frontend.vercel.app'];
app.use(cors({
  credentials: true,
  origin: allowedOrigins,
}));

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

app.get('/profile', (req, res) => {
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

// Endpoint for profiling
app.post('/profile123', upload.single('profileImage'), async (req, res) => {
  try {
    const { token } = req.cookies;

    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user ID from JWT payload
      const userId = info.id;

      // Retrieve user information
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Parse request body for profile data
      const { firstName, lastName, organizationName, profession } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !organizationName || !profession) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Create profile object
      const profile = new Profile({
        firstName,
        lastName,
        organizationName,
        profession,
        profileImage: req.file ? req.file.path : null, // Path to uploaded profile image
        authorId: userId // Associate profile with user
      });

      // Save profile to database
      await profile.save();

      res.json({ message: 'Profile created successfully' });
    });
  } catch (error) {
    console.error('Error in /profile endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /createProject endpoint

// Endpoint for creating project title and description
app.post('/createProject/titleDesc', async (req, res) => {
  try {
    const { token } = req.cookies;
    const { title, description } = req.body;

    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Generate a new projectId
      const projectId = new mongoose.Types.ObjectId();

      // Create new project with title, description, and projectId
      const project = new Project({
        userId: info.id,
        projectId: projectId,
        title,
        description,
      });

      await project.save();

      // Include projectId in the cookies
      res.cookie('projectId', projectId.toString(), { httpOnly: true }).status(201).json({ message: 'Project title and description created successfully' });
    });
  } catch (error) {
    console.error('Error creating project title and description:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for uploading project image
// Endpoint for uploading project image
app.post('/createProject/image', projectUpload.single('imageFile'), async (req, res) => {
  try {
    const { token } = req.cookies;
    const { filename } = req.file;

    // Verify JWT token and extract user ID
    jwt.verify(token, secret, {}, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = decodedToken.userId;
      const projectId = req.body.projectId;

      // Update project with image filename
      await Project.findOneAndUpdate(
        { userId, projectId },
        { imageFile: filename }
      );

      res.status(200).json({ message: 'Project image uploaded successfully' });
    });
  } catch (error) {
    console.error('Error uploading project image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Endpoint for uploading project excel file
app.post('/createProject/excel', projectUpload.single('excelFile'), async (req, res) => {
  try {
    const { token } = req.cookies;
    const { filename } = req.file;

    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Update project with excel filename
      await Project.findOneAndUpdate(
        { userId: info.id },
        { excelFile: filename }
      );

      res.status(200).json({ message: 'Project excel file uploaded successfully' });
    });
  } catch (error) {
    console.error('Error uploading project excel file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for uploading project array of images
app.post('/createProject/arrayImages', projectUpload.array('arrayOfImages', 30), async (req, res) => {
  try {
    const { token } = req.cookies;
    const filenames = req.files.map(file => file.filename);

    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Update project with array of image filenames
      await Project.findOneAndUpdate(
        { userId: info.id },
        { arrayOfImages: filenames }
      );

      res.status(200).json({ message: 'Project array of images uploaded successfully' });
    });
  } catch (error) {
    console.error('Error uploading project array of images:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Modify the GET endpoint to get projects of the authenticated user
app.get('/projects', async (req, res) => {
  try {
    const { token } = req.cookies;

    // Verify JWT token to get the user's ID
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find projects associated with the user's ID
      const projects = await Project.find({ userId: info.id });

      res.json(projects);
    });
  } catch (error) {
    console.error('Error in GET /projects endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Modify the GET endpoint to get all parameters of a specific project
app.get('/projects/:id', async (req, res) => {
  try {
    const { token } = req.cookies;

    // Verify JWT token
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find the project by ID
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
    });
  } catch (error) {
    console.error('Error in GET /projects/:id endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// GET request endpoint for retrieving profile details for a particular user
app.get('/profile123', async (req, res) => {
  try {
    const { token } = req.cookies;

    // Verify JWT token to ensure user authentication
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Retrieve user information
      const user = await User.findById(info.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Retrieve profile associated with the user
      const profile = await Profile.findOne({ authorId: info.id });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found for this user' });
      }

      res.json(profile);
    });
  } catch (error) {
    console.error('Error in /profile endpoint:', error);
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

app.post('/sendEmails', async (req, res) => {
  try {
    const { subject, content, recipients, attachments } = req.body;

    // Check if recipients and attachments are provided
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ message: 'Recipients and attachments must be provided as arrays' });
    }

    // Log attachments array received
    console.log('Attachments received:', attachments);

    // Iterate over recipients and send email to each one
    for (let i = 0; i < recipients.length; i++) {
      const mailOptions = {
        from: 'shashanksuggala@yahoo.com',
        to: recipients[i],
        subject: subject || 'No Subject',
        text: content || 'No Content',
        attachments: [{
          filename: `image_${i + 1}.png`,
          content: attachments[i].content,
          encoding: 'base64'
        }] // Attach image data directly
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/', (req, res) => {
  res.send('Server is up and running 12');
});

app.listen(4000, () => {
  console.log("Server started at port 4000");
});
