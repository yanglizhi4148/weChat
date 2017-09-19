/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var mongoose = require('mongoose')
var Category = mongoose.model('Category')
var convert = require('koa-convert')

// admin new page
exports.new = convert(function *(next) {
    yield this.render('pages/category_admin', {
        title: 'Movie 后台分类录入页',
        category: {}
    })
})

// admin post movie
exports.save = convert(function *(next) {
    var _category = this.request.body.category
    var category = new Category(_category)

    yield category.save()

    this.redirect('/admin/category/list')
})

// catelist page
exports.list = convert(function *(next) {
    var catetories = yield Category.find({}).exec()

    yield this.render('pages/categorylist', {
        title: 'Movie 分类列表页',
        catetories: catetories
    })
})
