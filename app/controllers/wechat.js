'use strict'

var wechat=require('../../wechat/g')
var reply=require('../../wx/reply')
var wx=require('../../wx/index')
var convert=require('koa-convert')

exports.hear=convert(function *(next){
    this.middle=wechat(wx.wechatOptions.wechat,reply.reply)

    yield this.middle(next)
})