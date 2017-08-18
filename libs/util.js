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