const express = require('express');

const app = express();

let appData = {};

app.get('/', (req, res) => {
  res.status(200).json(appData);
});

app.use(express.static('images'));

app.listen(process.env.PORT || 3000, () => console.log("Listening to port 3000"));

require('./app.js').ondata = function (data) {
  appData = data;
};