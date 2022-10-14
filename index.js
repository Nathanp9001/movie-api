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

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
  Users.find()
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
  Users.findOne({ Username: req.params.Username })
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
Users.findOne({ Username: req.body.Username })
.then((user) => {
  if (user) {
    return res.status(400).send(req.body.Username + 'already exists');
  } else {
    Users
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
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
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
  Users.findOneAndUpdate({ Username: req.params.Username }, {
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
    Users.findOneAndUpdate({ Username: req.params.Username }, {
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
app.delete('/users/:Username', (req, res) => {
 Users.findOneAndRemove({ Username: req.params.Username })
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

// READ Get list of all movies 
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// READ Get info about a movie by title 
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title})
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// READ Get info about genre
app.get('/movies/genres/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name})
  .then((movies) => {
    res.send(movies.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// READ Get info about director
app.get('/movies/directors/:Name', (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name})
  .then((movies) => {
    res.send(movies.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
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
