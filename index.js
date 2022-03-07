
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require ('uuid'),
  app = express();


//ready data out of request body
app.use(bodyParser.json());

//morgan middleware, specifying that requests should be logged
app.use(morgan('common'));


//simple user list
let users = [ {
    id: 1,
    name: "Edward",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Kristen",
    favoriteMovies: ["Departures"]
  }
];

//list of favourite movies
let movies = [   
  {
    Title:"The Shawshank Redemption",
    Genre:{
      "Name": "Drama"
    },
    Director: {
      "Name": "Frank Darabont",
      "Born": 1959
    }
  },
  {
    Title:"The Lord of the Rings",
    Genre:{
      "Name": "Fantasy"
    },
    Director: {
      "Name": "Peter Jackson",
      "Born": 1961
    }
  },
  {
    Title:"Oldboy",
    Genre:{
      "Name": "Revenge"
    },
    Director: {
      "Name": "Chan-wook Park",
      "Born": 1963
    }
  },
  {
    Title:"Departures",
    Genre:{
      "Name": "Drama"
    },
    Director: {
      "Name": "Yojiro Takita",
      "Born": 1955
    }
  },
  {
    Title:"Forrest Gump",
    Genre:{
      "Name": "Comedy-Drama"
    },
    Director: {
      "Name": "Robert Zemeckis",
      "Born": 1951
    }
  },
  {
    Title:"Intouchable",
    Genre:{
      "Name": "Comedy"
    },
    Director: {
      "Name": "Oliver Nakache",
      "Born": 1973
    }
  },
  {
    Title:"Parasite",
    Genre:{
      "Name": "Drama"
    },
    Director: {
      "Name": "Joon-ho Bong",
      "Born": 1969
    }
  },
  {
    Title:"Confessions",
    Genre:{
      "Name": "Thriller"
    },
    Director: {
      "Name": "Tetsuya Nakashima",
      "Born": 1959
    }
  },
  {
    Title:"I Saw the Devil",
    Genre:{
      "Name": "Revenge"
    },
    Director: {
      "Name": "Jee-woon Kim",
      "Born": 1964
    }
  },
  {
    Title:"Memento",
    Genre:{
      "Name": "Thriller"
    },
    Director: {
      "Name": "Christopher Nolan",
      "Born": 1970
    }
  }
];


//route to add a new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if(newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('users need names')
  }
})

//route to update a user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400).send('no such user')
  }
})

//route to add a movie as favourite
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  }else{
    res.status(400).send('no such user')
  }
})

//route to delete a movie from the "favourite" list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  }else{
    res.status(400).send('no such user')
  }
})

//route to delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  }else{
    res.status(400).send('no such user')
  }
})

//display the array of movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  }else{
    res.status(400).send('no such movie')
  }
});

//READ
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  }else{
    res.status(400).send('no such genre')
  }
});

//READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  }else{
    res.status(400).send('no such director')
  }
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

//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
