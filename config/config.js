var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-dev',
        useLogger: true,
        root: rootPath,
        app: {
            name: 'Acromaster - Development'
        }
    },
    test: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-test',
        root: rootPath,
        useLogger: false,
        app: {
            name: 'Acromaster - Test'
        }
    },
    production: {
        db:  process.env.MONGOHQ_URL,
        root: rootPath,
        useLogger: true,
        app: {
            name: 'Acromaster'
        }
    }
};