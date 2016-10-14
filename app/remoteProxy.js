/**
 * A little explaining.  ManagementSDK checks if window exists, if it does
 * than it thinks its a browser and replaces the require('fs') with a stub.
 * Well electron has fs and window.  So... Rather than fork, this executes
 * the release functions in the browser thread which does not have window,
 * and TADA - workie workie
 *
 *
 */
const executor = require('code-push-cli/script/command-executor');
const ManagementSDK = require('code-push/script/management-sdk.js');

module.exports.releaseReact = (dir, authentication, reporter, ...command)=> {
    const ocwd = chdir(dir);
    process.env.PATH=`${process.env.PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`;
    executor.sdk = new ManagementSDK(authentication.token, {}, authentication.host);
    executor.log = (...args)=> {
        reporter.log(args.join(' '));
    };

    return executor.releaseReact(...command).then(ocwd, ocwd);
};
/**
 * Change directories, and/or
 * @param dir
 * @returns {function(*)}
 */
const chdir = (dir)=> {
    const odir = process.cwd();
    try {
        process.chdir(dir);
    } catch (e) {
        console.log('could not change into ', dir, e);
    }
    return (v)=> {
        try {
            process.chdir(odir);
        } catch (e) {
            console.log('could not change back to ', odir, e);
        }
        return v;
    }
};
