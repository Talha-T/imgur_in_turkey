// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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