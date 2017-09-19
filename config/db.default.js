/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var config = {
    host: '',
    port: 27017,
    user: null,
    pass: null,
    database: '',
}

module.exports = {
    dbUri: config.user ? `mongodb://${config.user}:${config.pass}@${config.host}/${config.database}` : `mongodb://${config.host}/${config.database}`,
    dbOptions: {
        useMongoClient: true
    }
}
