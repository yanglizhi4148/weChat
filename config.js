'use strict'

var path=require('path')
var util=require('./libs/util')
//定义一个文本文件
var wechat_file=path.join(__dirname,'./config/wechat.txt')


var config={
    wechat:{
        appID:'wxf8dce3cefe4d1a73',
        appSecret:'762169d8e70521f695228281b9cf266e',
        token:'ylzwxkf4148',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)//return一个promise
        },
        saveAccessToken:function(data){
            data=JSON.stringify(data)//把data转成一个字符串
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

module.exports=config//暴露config
