import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import config from './test-params.json';

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('workspacekey', config.workspaceKey);
tmr.setInput('workspaceid', config.workspaceId + '');
tmr.setInput('workspacesecret', config.workspaceSecret);
tmr.setInput('serverurl', config.serverUrl);
tmr.setInput('workspacefile', path.join(__dirname, 'test-workspace.dsl'));

tmr.setInput('command', 'unlock');

tmr.run();