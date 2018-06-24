require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

const chalk = require('chalk');

const download = require('download-file');
const uuid = require('uuid/v4');

const path = require('path');

const downloadOptions = (ext) => {
    return {
        directory: "../images/",
        filename: uuid() + '.' + ext
    };
};

// Build Snoowrap and Snoostorm clients
const reddit = new Snoowrap({
    userAgent: 'imgur_in_turkey',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS,
});

const client = new Snoostorm(reddit);

console.log(chalk.green('Initialized bot!'));

// Configure options for stream: subreddit & results per query
const streamOpts = {
    subreddit: 'test'
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

const imgurRegexPattern = `https?:\\/\\/(i.)?imgur.com\\/\\w+(.\\w+)?`;

let noImgurYet = 0;

// On comment, perform whatever logic you want to do
comments.on('comment', (comment) => {
    console.log(chalk.blue("Comment received: ") + comment.body);

    const imgurRegex = new RegExp(imgurRegexPattern);
    const imgurResult = imgurRegex.exec(comment.body);

    if (imgurResult != null) {
        console.log(chalk.green(`This comment has imgur link after ${noImgurYet} comments! Processing..`));

        noImgurYet = 0;

        // Regex matches
        const url = imgurResult[0];
        console.log(`Processing ${chalk.yellow(url)}`);

        download(url, downloadOptions(path.extname(url)), (err) => {
            if (err) throw err;
        });

    }

    else {
        noImgurYet++;
        console.log(chalk.red("This comment does not have an imgur link!"));
    }

});