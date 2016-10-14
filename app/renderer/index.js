
const path = require('path');
const fs = require('fs');
const app = process.env.HOT ? require('electrode-ota-ui') : require('electrode-ota-ui/dist/electron')['electrode-ota-ui'];

const loadConfig = ()=> {
    if (sessionStorage.host && sessionStorage.token) {
        return {
            authorization: {
                host: sessionStorage.host,
                token: sessionStorage.token
            }
        };
    }
    const f = path.join(process.env['LOCALAPPDATA'] || process.env['HOME'], '.code-push.config');
    try {
        const src = JSON.parse(fs.readFileSync(f));
        return {
            authorization: {
                host: src.customServerUrl,
                token: src.accessKey,
                hideHost: false
            }
        };
    } catch (e) {
        console.log('Could not open ', f, e);
    }
    return {};

};

module.exports = app.default(loadConfig(), 'container', window.executor);
