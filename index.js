'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const del = require('del');
const gm = require('gm').subClass({imageMagick: true});
const sharp = require('sharp');
const easyimg = require('easyimage');
const deferred = require('deferred');

const app = express();
const port = process.env.PORT || 3000;

const imageSourcePath = (__dirname + '/images/source/');
const imageGeneratedPath = (__dirname + '/images/generated/');
const imageTmpPath = (__dirname + '/images/tmp/');
const maxCacheTime = 10*60*60*1000;
// const maxCacheTime = 10*1000;

var removeImagesGenerated = () => {
  setInterval(function () {
    del([imageGeneratedPath+'*.jpg', imageTmpPath+'*.jpg']).then(paths => {
      console.log('Archivos eliminados :\n', paths.join('\n'));
    });
  }, maxCacheTime);
};

removeImagesGenerated();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  // removeImagesGenerated();
  res.sendFile(path.join(__dirname + '/public', 'home.html'));
});

app.get('/:width/:height', (req, res, next) => {

  let width = req.params.width;
  let height = req.params.height;
  if(width > 3500 || height > 3500)return next("max-limit");
  let path = getImageFilename(width, height)
    .then(function (path) {
      res.sendFile(path);
    }, function (err) {
      res.send(err);
    });
});

app.get('/g/:width/:height', (req, res) => {
  let width = req.params.width;
  let height = req.params.height;
  if(width > 3500 || height > 3500)return next("max-limit");
  let path = getImageFilename(width, height, 'g')
    .then(function (path) {
      res.sendFile(path);
    }, function (err) {
      res.send(err);
    });
});

app.use((err, req, res, next) => {
  console.log("err", err);
  if(err == "max-limit"){
    console.log("lol");
    return res.status(500).send("El width y el height deben ser menores o iguales a 3500");
  }
  res.end()
})

var getImageFilename = (width, height, args) => {
  let path = imageGeneratedPath;
  let tmpPath = imageTmpPath;
  path += (args == 'g' ? "grayscale": "");
  tmpPath += (args == 'g' ? "grayscale": "");
  // path += (args == 'c' ? "crazy": "");
  path += `#${width}#${height}.jpg` ;
  tmpPath += `#${width}#${height}.jpg` ;

  let q = deferred();

  if(fileExist(path)){
    q.resolve(path);
  }
  else{
    genImage(width, height, path, tmpPath, args).
      then(function (path) {
        q.resolve(path);
      },function (err) {
        q.reject(err);
      });
  }

  return q.promise;

};

var genImage = (width, height, path, tmpPath, filter) => {
  let q = deferred();
  let higher = (width > height ? width : height);
  let imageRandomFilePath = imageSourcePath + getRandomFileName();

  getDimensionsImage(imageRandomFilePath)
  .then(function (data) {
      let objNormalized = getNormalizedDimensions(higher, data);
      easyimg.rescrop({
         src: imageRandomFilePath , dst: (filter ? tmpPath:path),
         width:objNormalized.width, height:objNormalized.height,
         cropwidth:width, cropheight:height,
         x:0, y:0
        }).then(
        function(image) {
          applyFilter(path, tmpPath ,filter).then(function () {
            q.resolve(path);
          }, function (err) {
            q.reject(err)
          });
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

var applyFilter = (path, tmpPath ,filter) => {
  var q = deferred();
  if(filter){
    if(filter == "g"){
      var r = sharp(tmpPath)
                .grayscale()
                .toFile(path, function (err, data) {
                  if(err)q.reject(err);
                  q.resolve(data);
                });
    }
  }
  else {
    q.resolve("no filter");
  }
  return q.promise;
}

var getNormalizedDimensions = (dim, obj) => {
  let smaller = (obj.width < obj.height ? obj.width : obj.height);
  let ratio = dim / smaller;
  let result = {};
  result.width = obj.width*ratio;
  result.height = obj.height*ratio;

  return result;
}

var getDimensionsImage = (path) => {
  let q = deferred();
  gm(path)
    .size(function (err, size) {

      if (err){
        q.reject(err);
      }
      else {
        q.resolve(size);
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
