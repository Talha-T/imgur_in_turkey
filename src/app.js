require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

const chalk = require('chalk');

const upload = require('./upload');

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

    const imgurRegex = new RegExp(imgurRegexPattern);
    const imgurResult = imgurRegex.exec('https://i.imgur.com/ca4pb6q.png');

    if (imgurResult != null) {
        console.log(chalk.green(`This comment has imgur link after ${noImgurYet} comments! Processing..`));

        noImgurYet = 0;

        // Regex matches
        const url = imgurResult[0];
        console.log(`Processing ${chalk.yellow(url)}`);

        const ext = path.extname(url);
        const _path = './images/' + uuid() + ext;

        download(url, _path, function () {
            console.log(chalk.green("Download and write success!!"));
            upload(_path, path.extname(_path), (id) => {
                const uploadedUrl = `https://drive.google.com/uc?export=view&id=${id}`
                    console.log(chalk.green("Uploaded to: " + uploadedUrl));
                reddit.getComment(comment.id).reply(`Imgur resmini görüntüle: https://drive.google.com/uc?export=view&id=${id}  \
                *** ^Ben ^bir ^botum. ^Yapımcı: ^/u/ImplicitOperator ^Karmamı ^artırmam ^yorum ^limitimi ^artırıyor ^:)`);
            });
        });

    }

    else {
        noImgurYet++;
        console.log(chalk.red("This comment does not have an imgur link!"));
    }

});