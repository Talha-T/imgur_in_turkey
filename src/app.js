require("dotenv").config();

const PORT = process.env.PORT || 3000;

function feedData() {
  dataListener(data);
}

let dataListener;

let fileCount = 0;

const data = {
  fileCount,
  lastImgur: 0,
  lastComment: {},
  subreddit: process.env.SUBREDDIT,
  regex: "i.imgur ve i.redd.it",
  up: true
};
module.exports.ondata = cb => {
  dataListener = cb;
};

console.log(process.env.SUBREDDIT);

const Snoowrap = require("snoowrap");
const Snoostorm = require("snoostorm");

const chalk = require("chalk");

// const upload = require('./upload');

let IP = "0.0.0.0";

const publicIp = require("public-ip");

(async () => {
  IP = await publicIp.v4();
})();

const path = require("path");

const fs = require("fs");
const request = require("request");

const uuid = require("uuid/v4");

// Build Snoowrap and Snoostorm clients
const reddit = new Snoowrap({
  userAgent: "imgur_in_turkey",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
});

reddit.config({
  continueAfterRatelimitError: true
});

const client = new Snoostorm(reddit);

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
  });
};

console.log(chalk.green("Initialized bot!"));

// Configure options for stream: subreddit & results per query
const streamOpts = {
  subreddit: process.env.SUBREDDIT
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

const regexPattern = `(https?:\\/\\/i.imgur.com\\/\\w+\.\\w+|https?:\\/\\/i.redd.it\\/\\w+\.\\w+)`;

// On comment, perform whatever logic you want to do
comments.on("comment", comment => {
  console.log(chalk.blue("Comment received: ") + comment.body);
  data.lastComment = comment;

  const regex = new RegExp(regexPattern);
  const regexResult = regex.exec(comment.body);

  if (regexResult != null) {
    console.log(
      chalk.green(
        `This comment has imgur link after ${
          data.lastImgur
        } comments! Processing..`
      )
    );

    // Regex matches
    const url = regexResult[0];
    console.log(`Processing ${chalk.yellow(url)}`);

    const ext = path.extname(url);
    const fileName = uuid() + ext;
    const _path = "./images/" + fileName;

    download(url, _path, function() {
      console.log(chalk.green("Download and write success!!"));
      reddit.getComment(
        comment.id
      ).reply(`[Imgur resmini görüntüle](http://${IP}:${PORT}/${fileName})

                ^(Comeback! -- Ben bir botum. -- Yapımcı: /u/ImplicitOperator) [^(status)](http://${IP}:${PORT}/) ^(--) [^(bağış)](https://www.patreon.com/implicitr)`);

      data.lastImgur = 0;
      data.fileCount++;
      feedData();
    });
  } else {
    data.lastImgur++;
    feedData();
    console.log(chalk.red("This comment does not have an imgur link!"));
  }
});

fs.readdir("images", (err, files) => {
  data.fileCount = files ? files.length : 0;
  feedData();
});
