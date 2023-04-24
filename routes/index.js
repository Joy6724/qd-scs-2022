'use strict'

const Router = require('koa-router')
const backRouter = require('./back')
const fontRouter = require('./front')
const competitionRouter = require('./competition')

const rootRouter = new Router()

rootRouter.use('', fontRouter.routes(), fontRouter.allowedMethods())
rootRouter.use('/bg', backRouter.routes(), backRouter.allowedMethods())
rootRouter.use('/competition', competitionRouter.routes(), competitionRouter.allowedMethods())

module.exports = rootRouter
