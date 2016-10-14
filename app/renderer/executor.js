const executor = require('electron').remote.require('../remoteProxy');

const commands = 'deploymentName,description,rollout,development,disabled,mandatory,bundleName,gradleFile,plistFile,plistFilePrefix,sourcemapOutput'.split(/\,\s*/);

const commandMap = commands.reduce((ret, v)=> {
    ret[`--${v}`] = v;
    return ret;
}, {['--targetBinaryVersion']: 'appStoreVersion'});
//
const makeProxy = (method)=> (authentication, releaseDir, args, reporter = exports.console)=> {
    //copy it
    args = args.concat();
    const cmds = args.slice(2);
    const [appName, platform = 'ios'] = args;
    const command = {appName, platform};
    //unparse commands
    while (cmds.length) {
        const current = cmds.shift();
        command[commandMap[current] || current] = cmds.shift();
    }

    return executor[method](releaseDir, authentication, reporter, command);

};

//expose to ease testing.
module.exports.console = console.log;
module.exports.releaseReact = makeProxy('releaseReact');
module.exports.releaseCordova = makeProxy('releaseCordova');
module.exports.release = makeProxy('release');
