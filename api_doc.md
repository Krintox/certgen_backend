API Documentation
Overview
This API provides endpoints for user authentication, profile management, post management, and project management. Below is the detailed documentation for each endpoint, including sample requests and responses.

Table of Contents
User Authentication
Register
Login
Get Profile
Logout
Post Management
Create Post
Update Post
Get All Posts
Get Post By ID
Profile Management
Create Profile
Get Profile
Get All Profile Information
Project Management
Create Project
Upload Project Images
Upload Project Cover Image
Upload Project Excel File
Get Project
User Authentication
Register
Endpoint: POST /auth/register

Description: Registers a new user.

Sample Request:

 
 
{
  "username": "johndoe",
  "password": "password123"
}
Sample Response:

 
 
{
  "_id": "60c72b1f9b1d8e3a4c8e4f5a",
  "username": "johndoe",
  "password": "$2a$10$EIXW...",
  "__v": 0
}
Login
Endpoint: POST /auth/login

Description: Logs in a user.

Sample Request:

 
 
{
  "username": "johndoe",
  "password": "password123"
}
Sample Response:

 
 
{
  "id": "60c72b1f9b1d8e3a4c8e4f5a",
  "username": "johndoe"
}
Get Profile
Endpoint: GET /auth/profile

Description: Retrieves the authenticated user's profile information.

Sample Response:

 
 
{
  "id": "60c72b1f9b1d8e3a4c8e4f5a",
  "username": "johndoe"
}
Logout
Endpoint: POST /auth/logout

Description: Logs out the authenticated user.

Sample Response:

 
 
"ok"
Post Management
Create Post
Endpoint: POST /posts/create

Description: Creates a new post.

Sample Request:

Form Data:
title: "My First Post"
files: [file1.jpg, file2.jpg]
Sample Response:

 
 
{
  "_id": "60c72c1f9b1d8e3a4c8e4f5b",
  "title": "My First Post",
  "cover": ["uploads/file1.jpg", "uploads/file2.jpg"],
  "author": "60c72b1f9b1d8e3a4c8e4f5a",
  "__v": 0
}
Update Post
Endpoint: PUT /posts/update/:id

Description: Updates an existing post.

Sample Request:

URL Parameter:
id: "60c72c1f9b1d8e3a4c8e4f5b"
Form Data:
title: "Updated Post Title"
files: [file3.jpg]
Sample Response:

 
 
{
  "_id": "60c72c1f9b1d8e3a4c8e4f5b",
  "title": "Updated Post Title",
  "cover": ["uploads/file1.jpg", "uploads/file2.jpg", "uploads/file3.jpg"],
  "author": "60c72b1f9b1d8e3a4c8e4f5a",
  "__v": 0
}
Get All Posts
Endpoint: GET /posts

Description: Retrieves all posts.

Sample Response:

 
 
[
  {
    "_id": "60c72c1f9b1d8e3a4c8e4f5b",
    "title": "My First Post",
    "cover": ["uploads/file1.jpg", "uploads/file2.jpg"],
    "author": {
      "username": "johndoe"
    },
    "createdAt": "2023-05-29T12:00:00.000Z",
    "__v": 0
  }
]
Get Post By ID
Endpoint: GET /posts/:id

Description: Retrieves a post by its ID.

Sample Request:

URL Parameter:
id: "60c72c1f9b1d8e3a4c8e4f5b"
Sample Response:

 
 
{
  "_id": "60c72c1f9b1d8e3a4c8e4f5b",
  "title": "My First Post",
  "cover": ["uploads/file1.jpg", "uploads/file2.jpg"],
  "author": {
    "username": "johndoe"
  },
  "createdAt": "2023-05-29T12:00:00.000Z",
  "__v": 0
}
Profile Management
Create Profile
Endpoint: POST /profile/create

Description: Creates a new profile.

Sample Request:

Form Data:
firstName: "John"
lastName: "Doe"
organizationName: "Company Inc."
profession: "Software Engineer"
file: profile.jpg
Sample Response:

 
 
{
  "message": "Profile created successfully"
}
Get Profile
Endpoint: GET /profile

Description: Retrieves the authenticated user's profile information.

Sample Response:

 
 
{
  "id": "60c72b1f9b1d8e3a4c8e4f5a",
  "username": "johndoe"
}
Get All Profile Information
Endpoint: GET /profile/getAll

Description: Retrieves all information about the authenticated user's profile.

Sample Response:

 
 
{
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Company Inc.",
  "profession": "Software Engineer",
  "profileImage": "uploads/profile.jpg",
  "totalFiles": 5,
  "totalProjects": 3,
  "projectNames": ["Project 1", "Project 2", "Project 3"],
  "username": "johndoe"
}
Project Management
Create Project
Endpoint: POST /projects/create

Description: Creates a new project.

Sample Request:

 
 
{
  "title": "New Project",
  "description": "Project Description"
}
Sample Response:

 
 
{
  "message": "Project created successfully",
  "projectId": "60c72d1f9b1d8e3a4c8e4f5c"
}
Upload Project Images
Endpoint: POST /projects/upload-images/:projectId

Description: Uploads images for a project.

Sample Request:

URL Parameter:
projectId: "60c72d1f9b1d8e3a4c8e4f5c"
Form Data:
files: [image1.jpg, image2.jpg]
Sample Response:

 
 
{
  "message": "Images uploaded successfully"
}
Upload Project Cover Image
Endpoint: POST /projects/upload-image/:projectId

Description: Uploads a cover image for a project.

Sample Request:

URL Parameter:
projectId: "60c72d1f9b1d8e3a4c8e4f5c"
Form Data:
file: cover.jpg
Sample Response:

 
 
{
  "message": "Image uploaded successfully"
}
Upload Project Excel File
Endpoint: POST /projects/upload-excel/:projectId

Description: Uploads an Excel file for a project.

Sample Request:

URL Parameter:
projectId: "60c72d1f9b1d8e3a4c8e4f5c"
Form Data:
file: data.xlsx
Sample Response:

 
 
{
  "message": "Excel file uploaded successfully"
}
Get Project
Endpoint: GET /projects

Description: Retrieves the authenticated user's project information.

Sample Response:

 
 
{
  "_id": "60c72d1f9b1d8e3a4c8e4f5c",
  "title": "New Project",
  "description": "Project Description",
  "authorId": "60c72b1f9b1d8e3a4c8e4f5a",
  "__v": 0
}

Send Email
POST /email/sendEmails

Description: to send multiple emails and attachments.

Sample Input:
{
  "subject": "Your Subject Here",
  "content": "Email content here",
  "recipients": ["shashanksuggala@gmail.com", "fullmovies9205@gmail.com"],
  "attachments": [
    {
      "content": "base64EncodedImageString1"
    },
    {
      "content": "base64EncodedImageString2"
    }
  ]
}


Sample response:
{
  "message": "Emails sent successfully"
}