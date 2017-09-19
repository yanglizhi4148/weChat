/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var path = require('path')
var util = require('../libs/util')
var Wechat = require('../wechat/wechat')
var convert = require('koa-convert')
var { wechat} = require('../config/app')

//定义一个文本文件
var wechat_file = path.join(__dirname, '../config/wechat.txt')
var wechat_ticket_file = path.join(__dirname, '../config/wechat_ticket.txt')


var config = {
    wechat: {
        appID: wechat.appID,
        appSecret: wechat.appSecret,
        token: wechat.token,
        getAccessToken: function () {
            return util.readFileAsync(wechat_file)//return一个promise
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data)//把data转成一个字符串
            return util.writeFileAsync(wechat_file, data)
        },
        getTicket: function () {
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket: function (data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_ticket_file, data)
        }
    }
}

exports.wechatOptions = config

exports.getWechat = convert(function () {
    var wechatApi = new Wechat(config.wechat)//初始化wechatApi

    return wechatApi
})
