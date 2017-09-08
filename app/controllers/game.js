'use strict'

var wx=require('../../wx/index')
var util=require('../../libs/util')
var Movie=require('../api/movie')

exports.guess=function *(next){//暴露方法，提供后面中间件的处理
    var wechatApi=wx.getWechat()
    var data = yield wechatApi.fetchAccessToken()
    var access_token = data.access_token
    var ticketData = yield wechatApi.fetchTicket(access_token)
    var ticket = ticketData.ticket//拿到授权票据
    var url = this.href
    var params = util.sign(ticket,url)

    console.log(params);
    yield this.render('wechat/game',params)
}

exports.find=function *(next){//暴露方法，提供后面中间件的处理
    var id=this.params.id//通过params获取id
    var wechatApi=wx.getWechat()
    var data = yield wechatApi.fetchAccessToken()
    var access_token = data.access_token
    var ticketData = yield wechatApi.fetchTicket(access_token)
    var ticket = ticketData.ticket//拿到授权票据
    var url = this.href
    var params = util.sign(ticket,url)
    var movie=yield Movie.searchById(id)

    params.movie=movie

    yield this.render('wechat/game',params)
}

