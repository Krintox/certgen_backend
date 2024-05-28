require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Import the database connection function

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const emailRoutes = require('./routes/emailRoutes')

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  credentials: true,
  origin: allowedOrigins,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

let dbStatus = 'Not connected';

// Connect to the database
connectDB().then(() => {
  dbStatus = 'Connected to database';
}).catch((error) => {
  dbStatus = `Error connecting to the database: ${error.message}`;
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/profile', profileRoutes);
app.use('/projects', projectRoutes);
app.use('/email', emailRoutes);

app.get('/', (req, res) => {
  res.send(`Server is up and running newCMUR. ${dbStatus}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
