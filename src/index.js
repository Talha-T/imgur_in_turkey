require('dotenv').config();

const PORT = process.env.PORT || 3000;

const express = require('express');
const path = require('path');
const app = express();

let appData = {
  fileCount: 0,
  lastImgur: 0,
  lastComment: {},
  subreddit: process.env.SUBREDDIT,
  regex: `https?:\\/\\/i.imgur.com\\/\\w+\.\\w+`,
  up: true
};

app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(200).json(appData);
});

app.use(express.static(path.join(__dirname, '../images')));

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));

require('./app.js').ondata(function (data) {
  appData = data;
});