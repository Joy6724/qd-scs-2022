'use strict'

module.exports = {
  appKeys: ['scs'],
  sessionKey: 'scs::sess',
  port: 2022,
  maxAge: 1000 * 60 * 60,
  username: 'admin',
  password: 'QDscs2022',
  returnConfig: {
    default: {
      code: 0,
      message: 'success'
    },
    noLogin: {
      code: -1,
      message: '未登录'
    },
    paramError: {
      code: -2,
      message: '参数错误'
    },
    notFound: {
      code: -3,
      message: '未查询到结果'
    },
    serviceError: {
      code: 500,
      message: '服务器错误'
    }
  },
  bgWhiteList: [
    '/bg/login',
    '/bg/management'
  ]
}
