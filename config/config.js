var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost/am-dev',
        useLogger: true,
        root: rootPath,
        app: {
            name: 'AcroMaster - Development'
        }
    },
    test: {
        db: 'mongodb://localhost/am-test',
        root: rootPath,
        useLogger: false,
        app: {
            name: 'AcroMaster - Test'
        }
    },
    production: {
        db: 'mongodb://localhost/am',
        root: rootPath,
        useLogger: true,
        app: {
            name: 'AcroMaster'
        }
    }
};