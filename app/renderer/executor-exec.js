const childProcess = require("child_process");
const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
const which = require('which');
const updateProject = require('./updateProject');

const withinTemp = (exec)=> {
    return new Promise((resolve, reject)=> {
        tmp.dir((err, path, fd, cleanupCallback)=> {
            if (err) return reject(err);
            exec(path, fd).then(resolve, reject).then(cleanupCallback, cleanupCallback);
        });
    });
};

exports._spawn = childProcess.spawn;

exports.console = console;

exports._makeCodePushConfig = (dir, {token, host}, reporter = exports.console) => new Promise((resolve, reject)=> {
    const config = path.join(dir, '.code-push.config')
    reporter.log(`creating temporary config in "${config}"`);
    fs.writeFile(config, '' + JSON.stringify({
            accessKey: token,
            customServerUrl: host,
            preserveAccessKeyOnLogout: false
        }), (e, o)=> e ? reject(e) : resolve(config));

});

exports._makeCommand = (cmd)=>(authentication, releaseDir, args, reporter = exports.console)=> {

    return exports._whichCodePush().then((codePushPath)=>withinTemp((path)=> exports._makeCodePushConfig(path, authentication).then(_=>exports._runCommand(path, releaseDir, args, reporter, codePushPath, cmd))))

};
exports._whichCodePush = ()=>new Promise((resolve, reject)=> which('code-push', {path: '/usr/local/bin:/usr/bin'}, (e, p)=> {

    e ? reject(e) : resolve(p)
}));

exports._runCommand = (LOCALAPPDATA, cwd, args, reporter, codePushPath = 'code-push', cmd)=> new Promise((resolve, reject)=> {

    const allArgs = [cmd].concat(args);
    reporter.log(`Running: "code-push ${allArgs.join(' ')}"`);
    try {
        const codePushProcess = exports._spawn(codePushPath, allArgs, {
            cwd,

            env: Object.assign({}, process.env, {
                NODE_TLS_REJECT_UNAUTHORIZED: 0, LOCALAPPDATA,
                PATH: `/usr/bin:/usr/local/bin:/bin:${cwd}/node_modules/.bin`

            })
        });
        if (codePushProcess.error) {
            return reject(codePushProcess.error);
        }
        codePushProcess.stdout && codePushProcess.stdout.on("data", (data)=> {
            const str = data && data.toString().trim();
            if (str) reporter.log(str);
        });
        codePushProcess.stderr.on("data", (data)=> {
            reporter.error(data.toString().trim())
        });
        codePushProcess.on && codePushProcess.on("close", (exitCode)=> (exitCode) ? reject(new Error(`"code-push ${args.join(' ')}" command exited with code "${exitCode} "."`)) : resolve(null));
    } catch (e) {
        reject(e.message);

    }
});

exports.releaseReact = exports._makeCommand('release-react');
exports.releaseCordova = exports._makeCommand('release-cordova');
exports.release = exports._makeCommand('release');
