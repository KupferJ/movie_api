
const express = require('express'),
  morgan = require('morgan'),
  app = express();

//morgan middleware, specifying that requests should be logged
app.use(morgan('common'));

//list of favourite movies
let topMovies = [   
  {
    title:'The Shawshank Redemption',
    director:'Frank Darabont'
  },
  {
    title:'The Lord of the Rings',
    director:'Peter Jackson'
  },
  {
    title:'Oldboy',
    director:'Park Chan-wook'
  },
  {
    title:'Departures',
    director:'Yôjirô Takita'
  },
  {
    title:'Forrest Gump',
    director:'Robert Zemeckis'
  },
  {
    title:'Intouchable',
    director:'Oliver Nakache'
  },
  {
    title:'Parasite',
    director:'Bong Joon-ho'
  },
  {
    title:'Confessions',
    director:'Tetsuya Nakashima'
  },
  {
    title:'I Saw the Devil',
    director:'Kim Jee-woon'
  },
  {
    title:'Memento',
    director:'Christopher Nolan'
  }
];

//display the array of movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//Welcome message for the '/' URL
app.get('/', (req, res) => {
  res.send('Welcome to my movie application.'); 
});

//gives access to the static file 
app.use(express.static('public'));

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occured.');
});

//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
