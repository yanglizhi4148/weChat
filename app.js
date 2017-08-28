'use strict'

var Koa=require('koa')
var path=require('path')
var wechat=require('./wechat/g')
var util=require('./libs/util')
var config=require('./config')
var reply=require('./wx/reply')
//定义一个文本文件
// var wechat_file=path.join(__dirname,'./config/wechat.txt')


var app=new Koa()

// app.use(wechat(config.wechat))//把config方法传给wechat
app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234');


//初始配置
// 'use strict'
// var Koa=require('koa')
// var sha1=require('sha1')
// var config={
//     wechat:{
//         appID:'wxf8dce3cefe4d1a73',
//         apSecret:'762169d8e70521f695228281b9cf266e',
//         token:'ylzwxkf4148',
//     }
// }
// var app=new Koa()
// app.use(function*(next){
//     console.log(this.query)
//     var token=config.wechat.token
//     var signature=this.query.signature
//     var nonce=this.query.nonce
//     var timestamp=this.query.timestamp
//     var echostr=this.query.echostr
//     var str=[token,timestamp,nonce].sort().join('')
//     var sha=sha1(str)
//
//     if(sha===signature){
//         this.body=echostr+''
//     }else{
//         this.body='wrong'
//     }
// })
//
// app.listen(1234)
// console.log('Listening:1234')






