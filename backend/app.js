const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauce')

const app = express();
app.use(express.json());

//// Connection to MongoDB with ENV variable ////
  require('dotenv').config();

  const USER = process.env.USER;
  const PWD = process.env.PWD;
  const URL = process.env.URL;

  mongoose.connect(`mongodb+srv://${USER}:${PWD}@${URL}`,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB OK'))
  .catch(() => console.log('KO MongoDB'));
//////////////////////////////////////////////////

///////////////////// HELMET /////////////////////
  const helmet = require("helmet");
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//////////////////////////////////////////////////

///////////////// Cross-Origin /////////////////
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
//////////////////////////////////////////////////

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
module.exports = app;