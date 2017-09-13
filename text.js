'use strict'
var Koa=require('koa')
var sha1=require('sha1')
var config={
    wechat:{
        appID:'wxf8dce3cefe4d1a73',
        apSecret:'762169d8e70521f695228281b9cf266e',
        token:'ylzwxkf4148',
    }
}
var app=new Koa()
app.use(function*(next){
    console.log(this.query)
    var token=config.wechat.token
    var signature=this.query.signature
    var nonce=this.query.nonce
    var timestamp=this.query.timestamp
    var echostr=this.query.echostr
    var str=[token,timestamp,nonce].sort().join('')
    var sha=sha1(str)

    if(sha===signature){
        this.body=echostr+''
    }else{
        this.body='wrong'
    }
})

app.listen(1234)
console.log('Listening:1234')