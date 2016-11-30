'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const easyimg = require('easyimage');
const deferred = require('deferred');

const app = express();
const port = process.env.PORT || 3000;
const imageSourcePath = (__dirname + '/images/source/');
const imageGeneratedPath = (__dirname + '/images/generated/');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public', 'home.html'));
});

app.get('/:width/:height', (req, res) => {
  let width = req.params.width;
  let height = req.params.height;
  let path = getImageFilename(width, height)
    .then(function (path) {
      res.sendFile(path);
    }, function (err) {
      res.send(err);
    });
  // res.send(path);
  // res.send(`width: ${width}, height: ${height}`);
});

var getImageFilename = (width, height, args) => {
  let path = imageGeneratedPath;
  path += (args == 'g' ? "grayscale": "");
  path += (args == 'c' ? "crazy": "");
  path += `#${width}#${height}.jpg` ;

  let q = deferred();

  if(fileExist(path)){
    q.resolve(path);
  }
  else{
    genImage(width, height, path).
      then(function (path) {
        q.resolve(path);
      },function (err) {
        q.reject(err);
      });
  }

  return q.promise;

};

var genImage = (width, height, path) => {
  let q = deferred();

  easyimg.rescrop({
     src: imageSourcePath + 'trumpdonald--600x600.jpg', dst: path,
     width:600, height:600,
     cropwidth:width, cropheight:height,
     x:0, y:0
  }).then(
  function(image) {
     q.resolve(path);
  },
  function (err) {
    q.reject(err);
  }
);

  return q.promise;
}

var fileExist = (filepath) => {
  try {
    return fs.statSync(filepath).isFile();
  }
  catch (err) {
    return false;
  }
}

app.listen(port, () => {
  console.log(`Api Rest corriendo en localhost: ${port}`);
});
