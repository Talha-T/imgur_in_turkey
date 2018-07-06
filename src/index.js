const express = require('express');

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

app.use(express.static('images'));

app.listen(process.env.PORT || 3000, () => console.log("Listening to port 3000"));

require('./app.js').ondata(function (data) {
  console.log("got data! : " + data);
  appData = data;
});