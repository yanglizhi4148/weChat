'use strict'

var fs=require('fs')//引入fs模块
var Promise=require('bluebird')


//读文件
exports.readFileAsync=function(fpath,encoding){//暴露readFileAsync方法
    return new Promise(function(resolve,reject){
        fs.readFile(fpath,encoding,function(err,content){
            if(err) reject(err)//异常
            else resolve(content)
        })
    })
}

//写文件
exports.writeFileAsync=function(fpath,content){//暴露readFileAsync方法
    return new Promise(function(resolve,reject){
        fs.writeFile(fpath,content,function(err,content){
            if(err) reject(err)//异常
            else resolve()
        })
    })
}

var crypto = require('crypto')

var createNonce = function(){//生成随机字符串
    return Math.random().toString(36).substr(2,15)
}

var createTimestamp = function(){//生成随机时间戳
    return parseInt(new Date().getTime() / 1000, 10) + ''
}

var _sign = function(noncestr, ticket, timestamp, url){
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    var str = params.sort().join('&')//排序
    var shasum = crypto.createHash('sha1')//加密

    shasum.update(str)

    return shasum.digest('hex')
}

exports.sign=function(ticket, url){//生成签名的方法
    var noncestr = createNonce()
    var timestamp = createTimestamp()
    var signature = _sign(noncestr, ticket, timestamp, url)

    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}
