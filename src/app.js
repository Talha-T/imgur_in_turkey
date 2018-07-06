require('dotenv').config();

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
    regex: `https?:\\/\\/i.imgur.com\\/\\w+\.\\w+`,
    up: true
};
module.exports.ondata = (cb) => { dataListener = cb };

console.log(process.env.SUBREDDIT);

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

const chalk = require('chalk');

// const upload = require('./upload');

const path = require('path');

const fs = require('fs');
const request = require('request');

const uuid = require('uuid/v4');

// Build Snoowrap and Snoostorm clients
const reddit = new Snoowrap({
    userAgent: 'imgur_in_turkey',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS,
});

reddit.config({
    continueAfterRatelimitError: true
});

const client = new Snoostorm(reddit);

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

console.log(chalk.green('Initialized bot!'));

// Configure options for stream: subreddit & results per query
const streamOpts = {
    subreddit: process.env.SUBREDDIT,
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

const imgurRegexPattern = `https?:\\/\\/i.imgur.com\\/\\w+\.\\w+`;

let noImgurYet = 0;

// On comment, perform whatever logic you want to do
comments.on('comment', (comment) => {
    console.log(chalk.blue("Comment received: ") + comment.body);
    data.lastComment = comment;

    const imgurRegex = new RegExp(imgurRegexPattern);
    const imgurResult = imgurRegex.exec(comment.body);

    if (imgurResult != null) {
        console.log(chalk.green(`This comment has imgur link after ${data.lastImgur} comments! Processing..`));

        // Regex matches
        const url = imgurResult[0];
        console.log(`Processing ${chalk.yellow(url)}`);

        const ext = path.extname(url);
        const fileName = uuid() + ext;
        const _path = '../images/' + fileName + ext;

        download(url, _path, function () {
            console.log(chalk.green("Download and write success!!"));
            reddit.getComment(comment.id).reply(`Imgur resmini görüntüle: http://163.172.133.215:3000/${fileName}  \
                *** ^Ben ^bir ^botum. ^Yapımcı: ^/u/ImplicitOperator ^Karmamı ^artırmam ^yorum ^limitimi ^artırıyor ^:)`);

            data.lastImgur = 0;
            feedData();
        });
    }

    else {
        data.lastImgur++;
        feedData();
        console.log(chalk.red("This comment does not have an imgur link!"));
    }

});

fs.readdir("images", (err, files) => {
    fileCount = files.length;
});