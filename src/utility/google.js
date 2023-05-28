const { google } = require('googleapis');
const events = require('events');
const { resolve } = require('node:path');

//const CacheHandler = require('./cache');
//const { redis } = require('googleapis/build/src/apis/redis');
//const cache = new CacheHandler();

function unescapeSlashes(str) {
    let parsedStr = str.replace(/(^|[^\\])(\\\\)*\\$/, "$&\\");
  
    parsedStr = parsedStr.replace(/(^|[^\\])((\\\\)*")/g, "$1\\$2");
  
    try {
      parsedStr = JSON.parse(`"${parsedStr}"`);
    } catch(e) {
      return str;
    }
    return parsedStr ;
}
module.exports.GoogleHandler = class GoogleHandler {
    constructor() {
        this.authenticatedEvent = new events.EventEmitter();
        this.authenticated = false;
        this.getAccessToken();
    };

    awaitReady() {
        return new Promise((resolve) => {
            if (this.authenticated) return resolve(true);
            this.authenticatedEvent.on('ready', () => {
                return resolve(true);
            })
        })
    }
    async getAccessToken() {
        const auth = new google.auth.GoogleAuth({
            keyFile: resolve('./src/utility/static/googleoauth.json'),
			projectId: "terminal-350206",
            scopes: ["https://www.googleapis.com/auth/admin.directory.group", "https://www.googleapis.com/auth/admin.directory.group.member", "https://www.googleapis.com/auth/admin.directory.user", "https://www.googleapis.com/auth/apps.groups.settings", "https://www.googleapis.com/auth/admin.directory.user.security"]
        });
        const authClient = await auth.getClient();
        
        authClient.subject = 'management@scpf.network';

        this.authClient = authClient;


        await this.setupServices();
        this.authenticated = true;
        this.authenticatedEvent.emit('ready')
        return true;
    }

    async setupServices() {
        this.admin = google.admin({
            version: 'directory_v1',
            auth: this.authClient
        });
        this.groupssettings = google.groupssettings({
            version: 'v1',
            auth: this.authClient
        })

        return true;
    }

    CreateGroup(name) {
        return new Promise(async (resolve, reject) => {
            await this.awaitReady();

            const lowercase = name.replace(/\s+/g, '-').toLowerCase()
            const abbreviation = name.match(/[A-Z]+/g).join('').toLowerCase();

            this.admin.groups.insert({
                requestBody: {
                    id: abbreviation,
                    email: lowercase + '@scpf.network',
                    name: name,
                    adminCreated: true,
                    kind: 'admin#directory#group',
                }
            }, (err, res) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                resolve(res.data);
            });
        })
    }

    SetDefaultSettings(groupEmail) {
        return new Promise(async (resolve, reject) => {
            await this.awaitReady();

            this.groupssettings.groups.update({
                groupUniqueId: groupEmail,
                requestBody: {
                    whoCanJoin: 'INVITED_CAN_JOIN',
                    whoCanViewMembership: 'ALL_MANAGERS_CAN_VIEW',
                    whoCanViewGroup: 'ALL_MANAGERS_CAN_VIEW',
                    whoCanInvite: 'ALL_MANAGERS_CAN_INVITE',
                    allowExternalMembers: true,
                    whoCanPostMessage: 'ALL_MANAGERS_CAN_POST',
                    allowWebPosting: false,
                    membersCanPostAsTheGroup: false,
                    whoCanLeaveGroup: 'ALL_MEMBERS_CAN_LEAVE',
                    whoCanContactOwner: 'ALL_MANAGERS_CAN_CONTACT',
                    whoCanModerateMembers: 'OWNERS_AND_MANAGERS',
                    whoCanModerateContent: 'OWNERS_AND_MANAGERS',
                    whoCanAssistContent: 'OWNERS_AND_MANAGERS',
                    enableCollaborativeInbox: false,
                }
            }, (err, res) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                resolve(res);
            });
        })
    }

    GetGroupMembers(email, bypassCache, pageToken, members) {
        return new Promise(async (resolve, reject) => {

            const redisKey = `googleworkspace:group:members:${email}`;
            //const cachedResult = await cache.getAsync(redisKey);

            //if (cachedResult) {
            //    return resolve(JSON.parse(cachedResult)); 
            //}

            await this.awaitReady();

            const config = {
                groupKey: email,
                maxResults: 200,
            }

            if (pageToken) {
                config.pageToken = pageToken;
            }

            if (!members) {
                members = [];
            }

            this.admin.members.list(config, async (err, res) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                members = members.concat(res.data.members ? res.data.members : []);

                if (res.data && res.data.nextPageToken) {
                    resolve(this.GetGroupMembers(email, bypassCache, res.data.nextPageToken, res.data.members))
                } else {
                    //await cache.setAsync(redisKey, JSON.stringify(members));
                    //await cache.expireAsync(redisKey, 60 * 5);
                    resolve(members);
                }
            });
        })
    }

    AddUserToGroup(groupemail, memberemail) {
        return new Promise(async (resolve, reject) => {
            await this.awaitReady();

            this.admin.members.insert({
                groupKey: groupemail,
                requestBody: {
                    kind: 'admin#directory#member',
                    email: memberemail,
                    role: 'MEMBER',
                }
            }, async (err, res) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                const redisKey = `googleworkspace:group:members:${groupemail}`;
                //const cachedResult = await cache.getAsync(redisKey);

                //if (cachedResult) {
                 //   await cache.delAsync(redisKey);
                //}

                resolve(res.data);
            })
        })
    }

    RemoveUserFromGroup(groupemail, memberemail) {
        return new Promise(async (resolve, reject) => {
            await this.awaitReady();

            this.admin.members.delete({
                groupKey: groupemail,
                memberKey: memberemail
            }, async (err, res) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                const redisKey = `googleworkspace:group:members:${groupemail}`;
               // const cachedResult = await cache.getAsync(redisKey);

                //if (cachedResult) {
                //    await cache.delAsync(redisKey);
                //}

                resolve(res);
            })
        })
    }

    // DIADataSheet = '1TqTKJ-b8k5TUXZMbfg7oMS9G7fTWo1B-bDmosFxjkao';
    // DIAFormattedSheet = '1XQqbWx67Bm2bfJ-VFnW8xtF6jeWoJfLhLo9bproMwyc';

    // GetAlternateAccountData() {
    //     return new Promise(async (resolve, reject) => {
    //         await this.awaitReady();
    //         this.sheets.spreadsheets.values.get({
    //             spreadsheetId: this.DIADataSheet,
    //             range: 'Alts!A:G',
    //             majorDimension: 'ROWS',
    //             valueRenderOption: 'UNFORMATTED_VALUE',
    //             dateTimeRenderOption: 'FORMATTED_STRING'
    //         }, (err, res) => {
    //             if (err) {
    //                 console.error(err);
    //                 return reject(err);
    //             }

    //             var mapped = res.data.values.map((x) => {
    //                 return {
    //                     main: {
    //                         username: x[0],
    //                         id: x[1],
    //                         snowflake: x[2]
    //                     },
    //                     alt: {
    //                         username: x[4],
    //                         id: x[5],
    //                         snowflake: x[6]
    //                     }
    //                 }
    //             });

    //             resolve(mapped);
    //         })
    //     })
    // }

    // GetGOIData() {
    //     return new Promise(async (resolve, reject) => {
    //         await this.awaitReady();
    //         this.sheets.spreadsheets.values.get({
    //             spreadsheetId: this.DIADataSheet,
    //             range: 'GOIs!A:D',
    //             majorDimension: 'ROWS',
    //             valueRenderOption: 'UNFORMATTED_VALUE',
    //             dateTimeRenderOption: 'FORMATTED_STRING'
    //         }, (err, res) => {
    //             if (err) {
    //                 console.error(err);
    //                 return reject(err);
    //             }

    //             var mapped = res.data.values.map((x) => {
    //                 return {
    //                     name: x[0],
    //                     reason: x[1],
    //                     id: x[2],
    //                     diaid: x[3]
    //                 }
    //             });

    //             resolve(mapped);
    //         })
    //     })
    // }

    // GetPOIData() {
    //     return new Promise(async (resolve, reject) => {
    //         await this.awaitReady();
    //         this.sheets.spreadsheets.values.get({
    //             spreadsheetId: this.DIADataSheet,
    //             range: 'POIs!A:D',
    //             majorDimension: 'ROWS',
    //             valueRenderOption: 'UNFORMATTED_VALUE',
    //             dateTimeRenderOption: 'FORMATTED_STRING'
    //         }, (err, res) => {
    //             if (err) {
    //                 console.error(err);
    //                 return reject(err);
    //             }

    //             var mapped = res.data.values.map((x) => {
    //                 return {
    //                     name: x[0],
    //                     reason: x[1],
    //                     id: x[2],
    //                     diaid: x[3]
    //                 }
    //             });

    //             resolve(mapped);
    //         })
    //     })
    // }

    // AddAlternateAccount(Row, Values) {
    //     return new Promise(async (resolve, reject) => {
    //         await this.awaitReady();
    //         this.sheets.spreadsheets.values.update({
    //             spreadsheetId: this.DIAFormattedSheet,
    //             range: `Alternate Accounts!C${Row}:I${Row}`,
    //             valueInputOption: 'USER_ENTERED',
    //             includeValuesInResponse: false,
    //             resource: {
    //                 range: `Alternate Accounts!C${Row}:I${Row}`,
    //                 majorDimension: 'ROWS',
    //                 values: [Values]
    //             }
    //         }, (err, res) => {
    //             if (err) {
    //                 console.error(err);
    //                 return reject(err);
    //             }

    //             resolve(res);
    //         })
    //     })
    // }
} 