/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var config = {
    host: '127.0.0.1',
    port: 27017,
    user: null,
    pass: null,
    database: 'test',
}

module.exports = {
    dbUri: config.user ? `mongodb://${config.user}:${config.pass}@${config.host}/${config.database}` : `mongodb://${config.host}/${config.database}`,
    dbOptions: {
        useMongoClient: true
    }
}
