import jwt from 'jsonwebtoken';

require('dotenv/config');

class Auth {
  verify(req, res, next) {
    const token = req.headers['access-token'];
    if (!token) {
      return res.status(401).json({ message: 'no token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(500).json({ message: 'unauthorized', err });
      }

      req.user_id = decoded.id;
      next();
    });
  }
}

export default new Auth();
