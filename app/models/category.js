/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var mongoose = require('mongoose')
var CategorySchema = require('../schemas/category')
var Category = mongoose.model('Category', CategorySchema)

module.exports = Category