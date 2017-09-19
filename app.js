/**
 * Created by Lizhi Yang(njalizhi@163.com)
 */

'use strict'

var Koa=require('koa')
var fs=require('fs')
var mongoose=require('mongoose')
var{dbUri,dbOptions}=require('./config/db')
mongoose.connect(dbUri,dbOptions)

//models loading
var models_path=__dirname+'/app/models'
var walk=function(path){
    fs
        .readdirSync(path)
        .forEach(function(file){
            var newPath=path+'/'+file
            var stat=fs.statSync(newPath)

            if(stat.isFile()){
                if(/(.*)\.(js|coffee)/.test(file)){
                    require(newPath)
                }
            }
            else if(stat.isDirectory()){
                walk(newPath)
            }
        })
}
walk(models_path)

var menu=require('./wx/menu')
var wx=require('./wx/index')
var wechatApi=wx.getWechat()

wechatApi.deleteMenu().then(function(){
    return wechatApi.createMenu(menu)
})
    .then(function(msg){
        console.log(msg);
    })

var app=new Koa()
var Router=require('koa-router')//引入路由模块
var session=require('koa-session')
var bodyParser=require('koa-bodyparser')
var convert=require('koa-convert')
var router=new Router()//拿到路由实例
var User=mongoose.model('User')//User是数据库模型
var views=require('koa-views')//增加jade
var moment=require('moment')

app.use(views(__dirname+'/app/views',{
    extension:'jade',
    locals:{
        moment:moment
    }
}))

app.keys=['test']
app.use(session(app))

app.use(bodyParser())

app.use(convert(function *(next){
    var user=this.session.user

    if(user && user._id){//user有没有挂载在session上，同时是合法的
        this.session.user=yield User.findOne({_id:user._id}).exec()//更新session
        this.state.user=this.session.user
    }
    else{
        this.state.user=null
    }
    yield next
}))

require('./config/routes')(router)

app.use(router.routes())
    .use(router.allowedMethods())

app.listen(80)
console.log('Listening:80');









