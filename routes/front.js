'use strict'

const Router = require('koa-router')
const front = require('../model/front')

const frontRouter = new Router()

frontRouter.get('/getResult', front.getResult)

frontRouter.get('/search', front.searchPage)

frontRouter.get('/result', front.resultPage)

frontRouter.get('/', front.searchPage)

module.exports = frontRouter
