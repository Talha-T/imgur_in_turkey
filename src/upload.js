'use strict';

const { google } = require('googleapis');
const fs = require('fs');

const creds = require('../client_secret.json');
const tokens = require('../credentials.json');

const uuid = require('uuid/v4');

const oauth = new google.auth.OAuth2(
    creds.web.client_id,
    creds.web.client_secret,
    creds.web.redirect_uris[0]
);

oauth.setCredentials(tokens);

const drive = google.drive({
    version: 'v3',
    auth: oauth
});

module.exports = function (url, ext, cb) {
    var fileMetadata = {
        'name': uuid(),
        parents: ['1U8xYjRd59GL1zaPUoa8VFdMJi_05Wt1r']
    };
    var media = {
        mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
        body: fs.createReadStream(url)
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name'
    }, function (err, file) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            cb(file.data.id);
        }
    });
}
