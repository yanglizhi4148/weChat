/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'
var Koa = require('koa')
var sha1 = require('sha1')
var {listenHost, listenPort, wechat} = require('./config/app')
var app = new Koa()
app.use(function*(next) {
    console.log(this.query)
    var token = wechat.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if (sha === signature) {
        this.body = echostr + ''
    } else {
        this.body = 'wrong'
    }
})

app.listen ( listenPort , listenHost )
console.log( `Listening :${listenHost}:${listenPort}`)