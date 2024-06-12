require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Middleware configuration
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://certgen-frontend.vercel.app', 'certgen-frontend.vercel.app', 'https://certto.in', 'certto.in', 'http://certto.in'];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Mongoose configuration
mongoose.set('strictQuery', false);

let dbStatus = 'Not connected';

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://krintox:krintox@cluster0.khivago.mongodb.net/", {
      useNewUrlParser: true,
    });
    console.log("Connected to database");
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1);
  }
};

// Connect to the database
connectDB().then(() => {
  dbStatus = 'Connected to database';
}).catch((error) => {
  dbStatus = `Error connecting to the database: ${error.message}`;
});

// Routes configuration
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/profile', profileRoutes);
app.use('/projects', projectRoutes);
app.use('/email', emailRoutes);

app.get('/', (req, res) => {
  res.send(`Server is up and running 🎉. ${dbStatus}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
