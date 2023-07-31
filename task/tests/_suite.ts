import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import { ensureCliExists } from '../cli-tool';

describe('CLI Execution Tests', function () {

    // it('should download the cli', function (done: Mocha.Done) {
    //     this.timeout(60000);
    //     ensureCliExists()
    //         .then(() => done());
    // });

    it('should call the push CLI functionality', function(done: Mocha.Done) {
        this.timeout(60000);
        executeTask('push.js', done);   
    });

    // it('should call the pull CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('pull.js', done);
    // });

    // it('should call the lock CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('lock.js', done);
    // });

    // it('should call the unlock CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('unlock.js', done);
    // });

    // it('should call the list CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('list.js', done);
    // });

    // it('should call the validate CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('validate.js', done);
    // });

    // it('should call the export CLI functionality', function(done: Mocha.Done) {
    //     this.timeout(10000);
    //     executeTask('export.js', done);
    // });

});

function executeTask(taskTest: string, done: Mocha.Done) {
    let tp = path.join(__dirname, taskTest);
    let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    tr.run();
    console.log(tr.stdout.replace(/%0A/g, '\n'));
    console.log(`Result: ${tr.succeeded}`);
    assert.equal(tr.succeeded, true, 'should have succeeded');
    assert.equal(tr.warningIssues.length, 0, "should have no warnings");
    assert.equal(tr.errorIssues.length, 0, "should have no errors");
    done();
}