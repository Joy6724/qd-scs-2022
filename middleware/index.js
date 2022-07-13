'use strict'

const { returnConfig, bgWhiteList } = require('../config/index')

module.exports = {
  checkLoginState: async (ctx, next) => {
    console.log(ctx.session)
    if (ctx.session.username || bgWhiteList.includes(ctx.path)) {
      await next()
    } else {
      ctx.body = {
        ...returnConfig.noLogin
      }
    }
  }
}
