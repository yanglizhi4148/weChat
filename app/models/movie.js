/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var mongoose = require('mongoose')
var MovieSchema = require('../schemas/movie')
var Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie