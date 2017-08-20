'use strict'

var sha1=require('sha1')
var Promise=require('bluebird')
var request=Promise.promisify(require('request'))//request是把bluebird进行promise化才有的

var prefix='https://api.weixin.qq.com/cgi-bin/'//作为URL的前缀
var api={//配置URL
    accessToken:prefix + 'token?grant_type=client_credential'
}

function Wechat(opts){
    var that=this//拿到this
    this.appID=opts.appID//通过opts也就是外层的业务逻辑传进来
    this.appSecret=opts.appSecret
    this.getAccessToken=opts.getAccessToken//获取票据的方法
    this.saveAccessToken=opts.saveAccessToken//存储票据的方法

    this.getAccessToken()//实现的是promise
        .then(function(data){//拿到票据信息
            try{
                data=JSON.parse(data)//字符串JSON化
            }
            catch(e){//捕获异常，文件不存在或不合法
                return that.updateAccessToken(data)//若存在异常则更新票据信息
            }

            if(that.isValidAccessToken(data)){//promise向下传递 若拿到信息判断有效期，实现合法性的检查
                Promise.revolve(data)//票据合法，把data传下去
            }
            else{
                return that.updateAccessToken()//不合法，更新票据
            }
        })
        .then(function(data){//拿到最终的票据结果，data是合法的data
            that.access_token=data.access_token//挂载到实例上，获取票据的凭证
            that.expires_in=data.expires_in//过期的字段

            that.saveAccessToken(data)//调用，把票据存起来
        })
}

Wechat.prototype.isValidAccessToken=function(data){
    if(!data||!data.access_token||!data.expires_in){
        //data或access_token或有效期字段expires_in不存在
        return false
    }

    var access_token=data.access_token//拿到票据
    var expires_in=data.expires_in//拿到过期时间
    var now=(new Date().getTime())//拿到当前时间

    if(now<expires_in){//判断当前的时间是否小于过期时间
        return true//如果小于，没过期
    }
    else{
        return false
    }
}

Wechat.prototype.updateAccessToken=function(data){//更新票据
    var appID=this.appID
    var appSecret=this.appSecret
    var url=api.accessToken+'&appid='+appID+'&secret='+ appSecret//请求票据的地址

    return new Promise(function(resolve,reject){//resolve,reject判断结果是成功还是失败
        request({url:url,json:true}).then(function(response){//request是httpsget请求后的封装的库
            //从URL地址里拿到JSON数据
            var data=response.body//拿到数组的第二个结果
            var now=(new Date().getTime())//拿到当前时间
            var expires_in=now+(data.expires_in?data.expires_in:0-20)*1000
            //新的过期时间=(当前时间+票据返回的过期时间-20)*10000
            //把票据提前20s
            data.expires_in=expires_in//把票据新的有效时间赋值给data对象

            resolve(data)
        })
    })

}
module.exports=function(opts){
    var wechat=new Wechat(opts)
    return function*(next){
        var token=opts.token
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
    }
}

