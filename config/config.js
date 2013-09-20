var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost:27017/am-dev',
        root: rootPath,
        app: {
            name: 'AcroMaster - Development'
        }
    },
    test: {
        db: 'mongodb://localhost/am-test',
        root: rootPath,
        app: {
            name: 'AcroMaster - Test'
        }
    },
    production: {
        db: 'mongodb://localhost/am',
        root: rootPath,
        app: {
            name: 'AcroMaster'
        }
    }
};