import * as fs from 'fs';
import * as path from 'path';
const https = require('follow-redirects').https;
const exec = require('child_process').exec;
import tl = require('azure-pipelines-task-lib/task');
const fetch = require('fetch');
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

        fetch.fetchUrl('https://api.github.com/repos/structurizr/cli/releases/latest', async function (err: Error, meta: any, body: any) {
            if (err) {
                throw err;
            }
            const json = JSON.parse(body.toString());
            const url = json.assets[0].browser_download_url;
            tl.debug(`Latest CLI [${url}]`);
            tl.debug('Downloading CLI');

            download(url, destinationFile)
                .then(() => {
                    tl.debug('File downloaded, unzipping');
                    var zip = new admZip(destinationFile);
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
                })
                .catch(error => {
                    tl.error(error);
                })

            // const file = fs.createWriteStream(destinationFile);
            // https.get(url, function (response: any) {
            //     response.pipe(file);

            //     // after download completed close filestream
            //     file.on("finish", () => {
            //         file.close(() => {
            //             tl.debug('File downloaded, unzipping');
            //             var zip = new admZip(destinationFile);
            //             zip.extractAllTo(destinationFolder, true);
            //             tl.debug('File downloaded, unzipping...Done');
            //             tl.debug('Setting CLI executable');
            //             let command = `chmod +x ${path.join(__dirname, 'cli', 'structurizr.sh')}`;
            //             exec(command, (error: Error, stdout: string, stderr: string) => {
            //                 if (stderr) {
            //                     tl.setResult(tl.TaskResult.Failed, `Error setting CLI executable: ${stderr}\n---------\n${stdout}`);
            //                     return;
            //                 }
            //                 if (error) {
            //                     tl.setResult(tl.TaskResult.Failed, `Error setting CLI executable: ${error}\n---------\n${stdout}`);
            //                     return;
            //                 }
            //                 tl.debug(stdout);
            //             });
            //             resolve(destinationFolder);
            //             return;
            //         });

            //     });
            // });



        });
    });
}

function download(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)){
            fs.unlinkSync(dest);
        }
        
        const file = fs.createWriteStream(dest, { flags: "wx" });

        const request = https.get(url, (response: any) => {
            if (response.statusCode === 302) {
                response.headers
            }
            if (response.statusCode < 400) {
                response.pipe(file);
            } else {
                file.close();
                fs.unlink(dest, () => { }); // Delete temp file
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });

        request.on("error", (err: Error) => {
            file.close();
            fs.unlink(dest, () => { }); // Delete temp file
            reject(err.message);
        });

        file.on("finish", () => {
            resolve();
        });

        file.on("error", (err: any) => {
            file.close();

            if (err.code === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(dest, () => { }); // Delete temp file
                reject(err.message);
            }
        });
    });
}