'use strict'

var Promise = require('bluebird')
var _=require('lodash')
var request = Promise.promisify(require('request'))//request是把bluebird进行promise化才有的
var util=require('./util')
var fs=require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'//作为URL的前缀
var api = {//配置URL
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary:{//临时素材
        upload:prefix+'media/upload?',
        fetch:prefix+'media/get?'
    },
    permanent:{//永久素材
        upload:prefix+'material/add_material?',
        fetch:prefix+'material/get_material?',
        uploadNews:prefix+'material/add_news?',
        uploadNewsPic:prefix+'media/uploadimg?',
        del:prefix+'material/del_material?',
        update:prefix+'material/update_news?',
        count:prefix+'material/get_materialcount?',//素材总数
        batch:prefix+'material/batchget_material?'//素材列表
    }
}

function Wechat(opts) {
    var that = this//拿到this
    this.appID = opts.appID//通过opts也就是外层的业务逻辑传进来
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken//获取票据的方法
    this.saveAccessToken = opts.saveAccessToken//存储票据的方法

    this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken=function(data){
    var that=this

    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){//没过有效期
            return Promise.resolve(this)
        }
    }

    this.getAccessToken()//实现的是promise
        .then(function (data) {//拿到票据信息
            try {
                data = JSON.parse(data)//字符串JSON化
            }
            catch (e) {//捕获异常，文件不存在或不合法
                return that.updateAccessToken(data)//若存在异常则更新票据信息
            }

            if (that.isValidAccessToken(data)) {//promise向下传递 若拿到信息判断有效期，实现合法性的检查
                return Promise.resolve(data)//票据合法，把data传下去
            } else {
                return that.updateAccessToken()//不合法，更新票据
            }
        })
        .then(function (data) {//拿到最终的票据结果，data是合法的data
            that.access_token = data.access_token//挂载到实例上，获取票据的凭证
            that.expires_in = data.expires_in//过期的字段

            that.saveAccessToken(data)//调用，把票据存起来

            return Promise.resolve(data)
        })
}

Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        //data或access_token或有效期字段expires_in不存在
        return false
    }

    var access_token = data.access_token//拿到票据
    var expires_in = data.expires_in//拿到过期时间
    var now = (new Date().getTime())//拿到当前时间

    if (now < expires_in) {//判断当前的时间是否小于过期时间
        return true//如果小于，没过期
    }
    else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function (data) {//更新票据
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret//请求票据的地址

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        request({url: url, json: true}).then(function (response) {//request是httpsget请求后的封装的库
            //从URL地址里拿到JSON数据
            var data = response.body//拿到数组的第二个结果
            var now = (new Date().getTime())//拿到当前时间
            var expires_in = now + (data.expires_in ? data.expires_in : 0 - 20) * 1000
            //新的过期时间=(当前时间+票据返回的过期时间-20)*10000
            //把票据提前20s
            data.expires_in = expires_in//把票据新的有效时间赋值给data对象

            resolve(data)
        })
    })

}
//更新永久素材接口
Wechat.prototype.uploadMaterial = function (type,material,permanent) {
    var that=this
    var form={}
    var uploadUrl=api.temporary.upload

    if(permanent){//判断参数有没有上传
        uploadUrl=api.permanent.upload

        _.extend(form,permanent)//继承
    }

    if(type==='pic'){//上传类型是图片
        uploadUrl=api.permanent.uploadNewsPic
    }
    if(type==='news'){//上传类型是图文
        uploadUrl=api.permanent.uploadNews
        form=material//material上传是图文是一个数组，其他时候是字符串
    }else{
        form.media=fs.createReadStream(material)
    }

    // var form={
    //     media:fs.createReadStream(filepath)
    // }

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=uploadUrl+'access_token='+data.access_token
                // var url=api.upload+'access_token='+data.access_token+'&type='+type
                if(!permanent){//如果不是永久素材类型
                    url+='&type='+type
                }
                else{
                    form.access_token=data.access_token
                }

                var options={
                    method:'POST',
                    url:url,
                    json:true
                }

                if(type==='news'){//类型是图文
                    options.body=form
                }
                else{
                    options.formData=form
                }

                request(options).then(function (response) {//request是httpsget请求后的封装的库
                    //从URL地址里拿到JSON数据
                    var _data = response.body//拿到数组的第二个结果

                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('Upload material fails')
                    }
                })
                    .catch(function(err){//捕获异常
                        reject(err)
                    })
            })
    })

}

//获取永久素材接口
Wechat.prototype.fetchMaterial = function (mediaId,type,permanent) {
    var that=this
    var form={}
    var fetchUrl=api.temporary.fetch//获取资源的URL地址

    if(permanent){//判断参数有没有上传
        fetchUrl=api.permanent.fetch
    }

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=fetchUrl+'access_token='+data.access_token+
                      '&media_id='+mediaId

                var options={method:'POST',url: url, json: true}
                var form={}
                if(permanent){
                    form.media_id=mediaId
                    form.access_token=data.access_token
                    options.body=form
                }
                else{
                    if(type==='video'){//不是永久素材类型是video
                        url=url.replace('https://','http://')//换成http协议
                    }
                    url+='&media_id='+mediaId
                }
                if(type==='news'||type==='video'){
                    request(options)
                        .then(function (response) {//request是httpsget请求后的封装的库
                            //从URL地址里拿到JSON数据
                            var _data = response.body//拿到数组的第二个结果

                            if(_data){
                                resolve(_data)
                            }
                            else{
                                throw new Error('Fetch material fails')
                            }
                        })
                        .catch(function(err){//捕获异常
                            reject(err)
                        })
                }
                else{
                    resolve(url)
                }

            })
    })

}

//删除永久素材接口
Wechat.prototype.deleteMaterial = function (mediaId) {
    var that=this
    var form={
        media_id:mediaId
    }

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=api.permanent.del+'access_token='+data.access_token+
                    '&media_id='+mediaId

                request({method:'POST',url: url,body:form, json: true}).then(function (response) {//request是httpsget请求后的封装的库
                    //从URL地址里拿到JSON数据
                    var _data = response.body//拿到数组的第二个结果

                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('Delete material fails')
                    }
                })
                    .catch(function(err){//捕获异常
                        reject(err)
                    })
            })
    })

}

//增加永久素材接口
Wechat.prototype.updateMaterial = function (mediaId,news) {
    var that=this
    var form={
        media_id:mediaId
    }

    _.extend(form,news)//让form继承传递进来的news

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=api.permanent.update+'access_token='+data.access_token+
                    '&media_id='+mediaId

                request({method:'POST',url: url,body:form, json: true}).then(function (response) {//request是httpsget请求后的封装的库
                    //从URL地址里拿到JSON数据
                    var _data = response.body//拿到数组的第二个结果

                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('Update material fails')
                    }
                })
                    .catch(function(err){//捕获异常
                        reject(err)
                    })
            })
    })

}

//永久素材总数
Wechat.prototype.countMaterial = function () {
    var that=this

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=api.permanent.count+'access_token='+data.access_token

                request({method:'GET',url: url, json: true}).then(function (response) {//request是httpsget请求后的封装的库
                    //从URL地址里拿到JSON数据
                    var _data = response.body//拿到数组的第二个结果

                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('Count material fails')
                    }
                })
                    .catch(function(err){//捕获异常
                        reject(err)
                    })
            })
    })

}

//永久素材列表
Wechat.prototype.batchMaterial = function (options) {
    var that=this

    options.type=options.type||'image'//类型默认是images
    options.offset=options.offset||0 //偏移量
    options.count=options.count||1

    return new Promise(function (resolve, reject) {//resolve,reject判断结果是成功还是失败
        that
            .fetchAccessToken()
            .then(function(data){
                var url=api.permanent.batch+'access_token='+data.access_token

                request({method:'POST',url: url,body:options, json: true}).then(function (response) {//request是httpsget请求后的封装的库
                    //从URL地址里拿到JSON数据
                    var _data = response.body//拿到数组的第二个结果

                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('Batch material fails')
                    }
                })
                    .catch(function(err){//捕获异常
                        reject(err)
                    })
            })
    })

}


Wechat.prototype.reply=function(){
    var content=this.body//拿到回复的内容
    var message=this.weixin

    var xml=util.tpl(content,message)

    this.status=200
    this.type='application/xml'
    this.body=xml
}

module.exports=Wechat