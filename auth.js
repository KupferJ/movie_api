const jwtSecret = 'your_jwt_secret'; //has to be the same key used in the JWTStratefy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //username you are enxoding in the JWT
    expiresIn: '7d', //specified that the token will expire in 7 days
    algorithm: 'HS256' //algorithm used to "sign" or encode the values of the HWT
  });
}

/**
 * POST login
 * @param {*} router 
 * @returns {object} token and user
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}