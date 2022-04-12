const jwt = require('jsonwebtoken');
require('dotenv').config();
const TOKEN = process.env.TOKEN;

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // return the token
    const decodedToken = jwt.verify(token, TOKEN); //token en .env
    const userId = decodedToken.userId;
    req.auth = {userId};
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};