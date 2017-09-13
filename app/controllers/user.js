'use strict'

var mongoose = require('mongoose')
var User = mongoose.model('User')
var convert=require('koa-convert')

// signup
exports.showSignup = convert(function *(next) {
    yield this.render('pages/signup', {
        title: '注册页面'
    })
})

exports.showSignin = convert(function *(next) {
    yield this.render('pages/signin', {
        title: '登录页面'
    })
})

exports.signup = convert(function *(next) {
    var _user = this.request.body.user

    var user = yield User.findOne({name: _user.name}).exec()

    if (user) {
        this.redirect('/signin')

        return next
    }
    else {
        user = new User(_user)
        yield user.save()

        this.session.user=user
        this.redirect('/')

    }

})

// signin
exports.signin = convert(function *(next) {
    var _user = this.request.body.user
    var name = _user.name
    var password = _user.password

    var user = yield User.findOne({name: name}).exec()

    if (!user) {
        this.redirect('/signup')

        return next
    }

    var isMatch = yield user.comparePassword(password,user.password)

    if (isMatch) {
        this.session.user = user

        this.redirect('/')
    }
    else {
        this.redirect('/signin')
    }

})

// logout
exports.logout = convert(function *(next) {
    delete this.session.user
    //delete app.locals.user

    this.redirect('/')
})

// userlist page
exports.list = convert(function *(next) {
    var users = yield User
        .find({})
        .sort('meta.updateAt')
        .exec()

    yield this.render('userlist', {
        title: 'imooc 用户列表页',
        users: users
    })

})

// midware for user
exports.signinRequired = convert(function *(next) {
    var user = this.session.user

    if (!user) {
        this.redirect('/signin')
    }
    else {
        yield next

    }
})

exports.adminRequired = convert(function *(next) {
    var user = this.session.user

    if (user.role <= 10) {
        this.redirect('/signin')
    }
    else {
        yield next
    }
})