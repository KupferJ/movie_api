
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require ('uuid');

const app = express();

//import mongoose and the "models.js"
const mongoose = require('mongoose');
Models = require('./models.js');
Movies = Models.Movie;
Users = Models.User;

//local
//mongoose.connect ('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
//MongoDB Atlas
mongoose.connect (process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//morgan middleware, specifying that requests should be logged
app.use(morgan('common'));
//use bodaparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use CORS
const cors = require('cors');
app.use(cors());

//import the "auth.js" file
let auth = require('./auth.')(app);
const passport = require('passport');
require('./passport');

//use express validator
const { check, validationResult } = require('express-validator');

const res = require('express/lib/response');



// READ - return list of all movies + JWT authentication (temporarily removed "passport.authenticate('jwt', { session:false }),"),
//so the React App can fetch the api
app.get ('/movies', //passport.authenticate('jwt', { session:false }), 
(req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});

//READ - return specific data about a singe movie
app.get('/movies/:title', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({Title: req.params.title})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie);
      }else{
        res.status(400).sendStatus('Movie not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//READ - return data about a genre by its name
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Name})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie.Genre);
      }else{
        res.status(400).send('Genre not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error ' + err);
    });
});

//READ - return data about a director by their name
app.get('/movies/director/:Name', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie.Director);
      }else{
        res.status(400).send('Director not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error ' + err);
    });
});

//CREATE - allows user to register (username, pw, email required)
app.post('/users', 
[ //Validation logic
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username})
    .then((user) => { //If the username already exists, show error message
      if(user) {
        return res.status(400).send('User with the Username ' + req.body.Username + ' already exists!')
      }else{
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {
            res.status(201).json(user)
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
          })
      }
    })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//READ - returns all the users
app.get('/users', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//READ - returns data on a specific user
app.get('/users/:Username', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOne({Username: req.params.Username})
    .then((user) => {
      if(user){
        res.status(200).json(user);
      }else{
        res.status(400).send('User with the username ' + req.params.Username + ' was not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//UPDATE - allows users to update their personal information
app.put('/users/:Username', passport.authenticate('jwt', { session:false }), 
[ //Validation logic
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  Users.findOneAndUpdate({User: req.params.Username},
    {$set: { //information that can be updated
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new:true }) //returns the updated document
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//CREATE - allows user to add a movie to their favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndUpdate({Username : req.params.Username},
    {$push: { FavoriteMovies: req.params.MovieID}},
    { new : true }) // Return the updated document
    .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//DELETE - allows user to delete a movie from their favorite
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    {$pull: {FavoriteMovies: req.params.MovieID}},
    { new: true})//returns updated document
    .then((updatedUser) => {
      res.json(updatedUser); //returns json object of updated user
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//DELETE - allows user to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
      if(user){
        res.status(200).send('User with the username ' + req.params.Username + ' was successfully deleted.');
      }else{
        res.status(500).send('User with the username ' + req.params.Username + ' was not found.')
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});


//Welcome message for the '/' URL
app.get('/', (req, res) => {
  res.send('Welcome to my movie application.'); 
});


app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});

//gives access to the static file 
app.use(express.static('public'));

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occured.');
});

//listen for requests, UPDATED
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0', () => {
  console.log('Listening on Port ' + port);
});
