'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});
const easyimg = require('easyimage');
const deferred = require('deferred');

const app = express();
const port = process.env.PORT || 3000;

const imageSourcePath = (__dirname + '/images/source/');
const imageGeneratedPath = (__dirname + '/images/generated/');
const maxCacheTime = 3105200;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public', 'home.html'));
});

app.get('/:width/:height', (req, res) => {
  let width = req.params.width;
  let height = req.params.height;
  // res.send(getRandomFileName());
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
  let higher;
  higher = (width > height ? width : height);
  let imageRandomFilePath= imageSourcePath + getRandomFileName();

  getDimensionsImage(imageRandomFilePath)
  .then(function (data) {
      let objNormalized = getNormalizedDimensions(higher, data);
      console.log("objNormalized: ", objNormalized);
      easyimg.rescrop({
         src: imageRandomFilePath , dst: path,
         width:objNormalized.width, height:objNormalized.height,
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
    },
    function (err) {
      q.reject(err);
    }
  )

  return q.promise;
};

var getNormalizedDimensions = (dim, obj) => {
  let smaller = (obj.width < obj.height ? obj.width : obj.height);
  console.log("smaller: ", smaller);
  let ratio = smaller / dim;
  let result = {};
  result.width = obj.width*ratio;
  result.height = obj.height*ratio;

  return result;
}

var getDimensionsImage = (path) => {
  console.log("getDimensionsImage");
  console.log("path: ", path);
  let q = deferred();
  gm(path)
    .size(function (err, size) {

      if (err){
        console.log(err);
        q.reject(err);
      }
      else {
        console.log("suc");
        q.resolve(size);
        console.log('width = ' + size.width);
        console.log('height = ' + size.height);
      }
    });
    return q.promise;
}

var getRandomFileName = () => {
  var files = fs.readdirSync(imageSourcePath);
  return files[Math.floor(Math.random() * files.length)];
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
