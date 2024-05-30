# Authentication Project with NodeJs
In this project user need to valid email so that he can access home page for changes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contact](#contact)

## Features

- User registration and login with Email and using Google directly
- Password encryption
- Session management
- JWT authentication ()
- Role-based access control (under process)
- Logout functionality

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (latest version 20.0)
- [MongoDB](https://www.mongodb.com/)

### Steps for project

1. Clone the repository:
   ```sh
   git clone https://github.com/SHOBHITjain13/Authenticatication.git

2. Navigate to the directory:

   cd user-authentication-project

3. Install dependencies: 

  npm install

4. Setup variables in .env file:

  PORT=3000

  MongoDb database = leapotUser

 MONGODB_URI=your_mongodb_connection_string

 JWT_SECRET=your_jwt_secret

5. Create database 
- leapotuser

## Usage
1. Run schema file
 `node user.js `
- then 
 `node server.js`

2. Go to browser and search 
 http://localhost:3000/validation



## Api-end points 

1. `GET /validation`
2. `GET /login`
3. `GET /register`
4. `POST /login`
5. `POST /register`
6. `GET /home`

## Contact
Name - Shobhit jain

[Email - Shobbitjain13@gmail.com](#Shobbitjain13@gmail.com)