import tl = require('azure-pipelines-task-lib/task');
import * as path from 'path';
const exec = require('child_process').exec;
import { ensureCliExists } from './cli-tool';


function run() {

    try {
        ensureCliExists().then(() => {
            const command: string | undefined = tl.getInput('command', true);

            let cliCommand = null;
            switch (command) {
                case 'pull':
                case 'push':
                case 'lock':
                case 'unlock':
                    cliCommand = getRemoteCommand(command);
                    break;

                case 'export':
                case 'list':
                case 'validate':
                    cliCommand = getLocalCommand(command);
                    break;
            }

            if (cliCommand) {
                executeCli(cliCommand);
                console.log(`Structurizr CLI [${command}] executed`);
                tl.setResult(tl.TaskResult.Succeeded, `Structurizr CLI [${command}] executed`);
            } else {
                tl.setResult(tl.TaskResult.Failed, `Unknown command [${command}]`);
            }
        });

    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

function getRemoteCommand(command: string) {

    console.log(`Executing Structurizr CLI -> ${command}`)

    const workspaceId: string | undefined = tl.getInput('workspaceid', true);
    const workspaceKey: string | undefined = tl.getInput('workspacekey', true);
    const workspaceSecret: string | undefined = tl.getInput('workspacesecret', true);
    const serverUrl: string | undefined = tl.getInput('serverurl', false);

    let workspaceCommands = `-url ${serverUrl} -id ${workspaceId} -secret ${workspaceSecret} -key ${workspaceKey}`;
    let cliCommand = null;
    switch (command) {
        case 'push': {
            const archive: boolean | undefined = tl.getBoolInput('archive', false);
            const merge: boolean | undefined = tl.getBoolInput('merge', false);
            const workspaceFile: string | undefined = tl.getInput('workspacefile', true);

            cliCommand = `push ${workspaceCommands} -w ${workspaceFile}`;
            if (archive) {
                cliCommand = `${cliCommand} -archive`;
            }
            if (merge) {
                cliCommand = `${cliCommand} -merge`;
            }
        }
            break;
        case 'pull':
        case 'lock':
        case 'unlock':
            cliCommand = `${command} ${workspaceCommands}`;
            break;
    }
    return cliCommand;
}

function getLocalCommand(command: string) {
    let cliCommand = null;
    const workspaceFile: string | undefined = tl.getInput('workspacefile', true);
    switch (command) {
        case 'export':
            const format: string | undefined = tl.getInput('format', true);
            const output: string | undefined = tl.getInput('output', true);
            cliCommand = `${command} -w ${workspaceFile} -f ${format} -o ${output}`;
            break;
        case 'list':
        case 'validate':
            cliCommand = `${command} -w ${workspaceFile}`;
            break;
    }
    return cliCommand;
}


function executeCli(cliArgs: string) {
    let command = `${path.join(__dirname, 'cli', 'structurizr.sh')} ${cliArgs}`;
    exec(command, (error: Error, stdout: string, stderr: string) => {
        if (stderr) {
            tl.setResult(tl.TaskResult.Failed, `Structurizr CLI Error: ${stderr}\n---------\n${stdout}`);
            return;
        }
        if (error) {
            tl.setResult(tl.TaskResult.Failed, `Structurizr CLI Error: ${error}\n---------\n${stdout}`);
            return;
        }
        console.log(stdout);
    });
}
run();