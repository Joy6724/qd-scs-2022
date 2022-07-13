'use strict'

const Router = require('koa-router')
const backRouter = require('./back')
const fontRouter = require('./front')

const rootRouter = new Router()

rootRouter.use('', fontRouter.routes(), fontRouter.allowedMethods())
rootRouter.use('/bg', backRouter.routes(), backRouter.allowedMethods())

module.exports = rootRouter
