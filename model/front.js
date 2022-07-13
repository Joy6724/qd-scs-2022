'use strict'

const fs = require('fs')
const path = require('path')
const { returnConfig } = require('../config/index')

module.exports = {
  getResult: async (ctx) => {
    const data = ctx.query || {}
    const {
      groupName, // 企业/团队名称 模糊查询
      projectName, // 项目名称 模糊查询
      directorName, // 负责人姓名 精确查询
      directorMobile // 负责人手机号 精确查询
    } = data

    if (!groupName || !projectName || !directorName || !directorMobile) {
      ctx.body = returnConfig.paramError
    }

    let result = null
    let dataObj = fs.readFileSync(path.join(__dirname, '../data/data.json'), { encoding: 'utf8' })
    dataObj = dataObj && JSON.parse(dataObj)

    for (const key in dataObj) {
      const dataItem = dataObj[key]

      if (dataItem.groupName && (dataItem.groupName + '').indexOf(groupName) > -1 &&
        dataItem.projectName && (dataItem.projectName + '').indexOf(projectName) > -1 &&
        dataItem.directorName === directorName &&
        dataItem.directorMobile === directorMobile) {
        result = dataItem
        break
      }
    }
    if (result) {
      ctx.body = {
        ...returnConfig.default,
        data: result
      }
    } else {
      ctx.body = {
        ...returnConfig.notFound
      }
    }
  },

  resultPage: async ctx => {
    await ctx.render('result')
  },

  searchPage: async ctx => {
    await ctx.render('index')
  }
}
