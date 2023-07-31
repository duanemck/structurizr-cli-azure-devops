import * as fs from 'fs';
import * as path from 'path';
const exec = require('child_process').exec;
import tl = require('azure-pipelines-task-lib/task');
const fetch = require('fetch');
const request = require('superagent');
const admZip = require('adm-zip');

export function ensureCliExists() {
    return new Promise<string>((resolve, reject) => {
        const destinationFile = path.join(__dirname, 'cli.zip');
        const destinationFolder = path.join(__dirname, 'cli');

        tl.debug(`Checking for [${destinationFolder}]`);
        if (fs.existsSync(destinationFolder)) {
            tl.debug(`CLI Exists, not downloading`);
            resolve(destinationFolder);
            return;
        }

        fetch.fetchUrl('https://api.github.com/repos/structurizr/cli/releases/latest', function (err: Error, meta: any, body: any) {
            if (err) {
                throw err;
            }
            const json = JSON.parse(body.toString());
            const url = json.assets[0].browser_download_url;
            tl.debug(`Latest CLI [${url}]`);
            tl.debug('Downloading CLI');
            request
                .get(url)
                .on('error', function (error: Error) {
                    reject(error.message);
                })
                .pipe(fs.createWriteStream(destinationFile))
                .on('finish', function () {
                    var zip = new admZip(destinationFile);
                    tl.debug('File downloaded, unzipping');
                    zip.extractAllTo(destinationFolder, true);
                    tl.debug('File downloaded, unzipping...Done');
                    tl.debug('Setting CLI executable');
                    let command = `chmod +x ${path.join(__dirname, 'cli', 'structurizr.sh')}`;
                    exec(command, (error: Error, stdout: string, stderr: string) => {
                        if (stderr) {
                            tl.setResult(tl.TaskResult.Failed, `Error setting CLI executable: ${stderr}\n---------\n${stdout}`);
                            return;
                        }
                        if (error) {
                            tl.setResult(tl.TaskResult.Failed, `Error setting CLI executable: ${error}\n---------\n${stdout}`);
                            return;
                        }
                        tl.debug(stdout);
                    });
                    resolve(destinationFolder);
                    return;
                });

        });
    });
}



//     return new Promise(async (resolve, reject) => {
//         if (!fs.existsSync(cliFolder)) {
//             tl.debug('Downloading structurizr CLI');
//             downloadAndUnzip(await getLatestCliUrl());            
//         } else {
//             resolve(null);
//         }
//     });
// }

// function downloadAndUnzip(fileUrl: string) {
//     const destinationFile = path.join(__dirname, 'cli.zip');
//     const destinationFolder = path.join(__dirname, 'cli');
//     request
//         .get(fileUrl)
//         .on('error', function (error: Error) {
//             tl.error(error.message);
//         })
//         .pipe(fs.createWriteStream(destinationFile))
//         .on('finish', function () {
//             var zip = new admZip(destinationFile);
//             console.log('start unzip');
//             zip.extractAllTo(destinationFolder, true);
//         });
// }

// function getLatestCliUrl(): Promise<string> {
//     return new Promise((resolve, reject) => {
//         fetch.fetchUrl('https://api.github.com/repos/structurizr/cli/releases/latest', function (err: Error, meta: any, body: any) {
//             if (err) {
//                 return reject(err);
//             }
//             console.log(body);
//             const json = JSON.parse(body.toString());
//             const url = json.assets[0].browser_download_url;
//             tl.debug(`Latest CLI [${url}]`);
//             resolve(url);

//         });
//     });
// }
