const fs = require('fs');
const path = require('path');
const plist = require('plist');

const readJSON = (...file)=> JSON.parse(fs.readFileSync(path.join(...file)));


const iosUpdate = module.exports.ios = (working_dir, name, CodePushServerURL, CodePushDeploymentKey)=> {
    const info = path.join(working_dir, 'iOS', name, 'Info.plist');
    const obj = plist.parse(fs.readFileSync(info, {encoding: 'utf-8'}));
    if (CodePushDeploymentKey) {
        obj.CodePushDeploymentKey = CodePushDeploymentKey;
    }
    if (CodePushServerURL) {
        obj.CodePushServerURL = CodePushServerURL;
    }
    const out = plist.build(obj);
    if (CodePushDeploymentKey || CodePushServerURL) {
        fs.renameSync(info, `${info}-${Date.now()}`);
        fs.writeFileSync(info, out, {encoding: 'utf-8'})
    }
    return Promise.resolve(out);
};

const update = module.exports.update = function (working_dir, CodePushServerURL, CodePushDeploymentKey) {
    const pkg = readJSON(working_dir, 'package.json');

    return iosUpdate(working_dir, pkg.name, CodePushServerURL, CodePushDeploymentKey);
};


if (require.main === module) {
    const [i1,i2, ...args] = process.argv;
    update(process.cwd(), ...args).then(console.log, console.err);
}
//<key>CodePushServerURL</key>
//<string>http://localhost.walmart.com:9000/</string>
//<key>CodePushDeploymentKey</key>
//<string>nmRSqsAdtkWoSXClHxIaBeGfLKCbPCmdDlrhKmiO</string>
