'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname + 'public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/home.html'));
});

app.get('/:width/:height', (req, res) => {
  let width = req.params.width;
  let height = req.params.height;
  res.send(`width: ${width}, height: ${height}`);
});

app.listen(port, () => {
  console.log(`Api Rest corriendo en localhost: ${port}`);
});
