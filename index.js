const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path'),
bodyParser = require('body-parser'),
uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/dbname', { useNewUrlParser: true, useUnifiedTopology: true });

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

//READ Get all users *
app.get('/users', (req, res) => {
  users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//READ Get a user by username *
app.get('/users/:Username', (req, res) => {
  users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// CREATE Add new user
app.post('/users', (req, res) => {
users.findOne({ Username: req.body.Username })
.then((user) => {
  if (user) {
    return res.status(400).send(req.body.Username + 'already exists');
  } else {
    users
    .create({
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    })
    .then((user) =>{res.status(201).json(user) })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
  }
})
.catch((error) => {
  console.error(error);
  res.status(500).send('Error: ' + error);
});
});

// UPDATE Edit user details
app.put('/users/:Username', (req, res) => {
  users.findOneAndUpdate({ Username: req.params.Username }, { $set:
  {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }
},
{ new: true },
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
  }
});
});

  // CREATE User add movie to list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, 
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
  });

  // DELETE User remove movie from list of favorites
  app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    users.findOneAndUpdate({ Username: req.params.Username }, {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, 
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
    });

  // DELETE Delete user account
app.delete('/users/Username', (req, res) => {
 users.findOneAndRemove({ Username: req.params.Username })
 .then((user) => {
  if (!user) {
    res.status(400).send(req.params.Username + ' was not found');
  } else {
    res.status(200).send(req.params.Username + ' was deleted.');
  }
 })
 .catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
 });
});

// READ Get list of all movies (*)
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ Get info about a movie by title (*)
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
});

// READ Get info about genre (*)
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
});

// READ Get info about director (*)
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
