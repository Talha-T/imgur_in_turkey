const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: "Bot is up!" });
});

app.listen(process.env.PORT || 3000, () => console.log("Listening to port 3000"));

require('./app.js');