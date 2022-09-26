const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path');

const app = express();

app.use(express.static('public'));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topMovies = [
  {
    title: 'Shrek',
    genre: 'Comedy'
  },
  {
    title: 'It (2017)',
    genre: 'Horror'
  },
  {
    title: 'Sonic the Hedgehog',
    genre: 'Action'
  }
];

app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
  res.send('Welcome to my movieFlix!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
