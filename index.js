const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path'),
bodyParser = require('body-parser'),
uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let users = [
  {
    id: '1',
    name: 'Bryce',
    favoriteMovies: ['Shrek']
  },
  {
    id: '2',
    name: 'Martha',
    favoriteMovies: ['Sonic the Hedgehog']
  }
]

let movies = [
  {
    Title: 'Shrek',
    Genre: {
      Name: 'Comedy',
      Description: 'Comedy is a genre of film in which the main emphasis is on humour.'
  },
  Director: {
    Name: 'Andrew Adamson',
    Born: '1966',
    Death: 'N/A'
  }
},
  {
    Title: 'It (2017)',
    Genre: 'Horror'
  },
  {
    Title: 'Sonic the Hedgehog',
    Genre: 'Action'
  }
];

app.use(morgan('combined', {stream: accessLogStream}));

// CREATE Add new user
app.post('/users', (req, res) => {
const newUser = req.body;

if (newUser.name) {
  newUser.id = uuid.v4();
  users.push(newUser);
  res.status(201).json(newUser)
} else {
  res.status(400).send('users need names')
}
});

// UPDATE Edit user details
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  
  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
  });

  // CREATE User add movie to list of favorites
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  
  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
  });

  // DELETE User remove movie from list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  
  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
  });

  // DELETE Delete user account
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  
  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
  });

// READ Get list of all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ Get info about a movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
});

// READ Get info about genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
});

// READ Get info about director
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }
});



app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
