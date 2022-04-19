const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/////////////////// Signup //////////////////////
  exports.signup = (req, res, next) => {
      bcrypt.hash(req.body.password, 10)
        .then(hash => {
          console.log(bcrypt.hash)
          const user = new User({
            email: req.body.email,
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'User created' }))
            .catch(error => res.status(400).json({message:'error of signup'}));
        })
        .catch(error => res.status(500).json({error}));
  };
//////////////////////////////////////////////////

/////////////////// Login ///////////////////////
  require('dotenv').config();
  const TOKEN = process.env.TOKEN;

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({error: 'User not found'});
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({error: 'incorrect password'});
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id},
                TOKEN,
                { expiresIn: '4h'}
              )
            });
          })
          .catch(error => res.status(500).json({error}));
      })
      .catch(error => res.status(500).json({error}));
  };
//////////////////////////////////////////////////