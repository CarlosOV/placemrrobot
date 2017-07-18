# PlaceMrRobot

Placeholder Images from Mr Robot. Demo [placemrrobot](http://placemrrobot.com/)

## Getting Started

Consider the following configurations:

* PORT : Port number (example: 2389)


### Prerequisities

* NodeJs must be installed version 4.x o later
* NPM must be installed version 3.3.x o later
* Forever (only production)
* Imagemagick

Install imagemagick

    sudo apt-get install imagemagick

Install dependencies for develop

    npm install && bower install

Install dependencies for production

    npm install --only=production && bower install --allow-root

## Instructions

For develop

    npm start

For production

    PORT=2389 forever start index.js

## Authors
* [GoOne](http://goone.pe)
* **Ormeño Vargas Carlos** - [CarlosOv](https://github.com/CarlosOv)
