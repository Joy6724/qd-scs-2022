'use strict'

const Router = require('koa-router')
const back = require('../model/back')
const middleware = require('../middleware/index')

const backRouter = new Router()

backRouter.use('/', middleware.checkLoginState)

backRouter.post('/login', back.login)
backRouter.get('/logout', back.logout)
backRouter.get('/heartBeat', back.heartBeat)
backRouter.get('/getResultList', back.getResultList)
backRouter.post('/import', back.importData)
backRouter.get('/login', back.loginPage)
backRouter.get('/management', back.managementPage)

module.exports = backRouter
