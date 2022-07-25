'use strict'

const fs = require('fs')
const path = require('path')
const Excel = require('exceljs')
const { username, password, returnConfig } = require('../config/index')
const { compare } = require('../utils/index')

module.exports = {
  login: async (ctx) => {
    const params = ctx.request.body || {}
    console.log(params)

    if (!params.username) {
      ctx.body = {
        ...returnConfig.paramError,
        message: '请输入用户名'
      }
    }

    if (!params.password) {
      ctx.body = {
        ...returnConfig.paramError,
        message: '请输入密码'
      }
    }

    if (params.username === username && params.password === password) {
      ctx.session.username = params.username
      ctx.body = {
        ...returnConfig.default,
        message: 'success'
      }
    } else {
      ctx.body = {
        ...returnConfig.noLogin,
        message: '用户名或密码错误'
      }
    }
  },

  logout: async (ctx) => {
    ctx.session = null
    ctx.body = {
      ...returnConfig.default
    }
  },

  getResultList: async (ctx) => {
    const resultList = []
    let dataObj = fs.readFileSync(path.join(__dirname, '../data/data.json'), { encoding: 'utf8' })
    dataObj = dataObj && JSON.parse(dataObj)
    for (const key in dataObj) {
      const dataItem = dataObj[key]
      resultList.push(dataItem)
    }
    resultList.sort(compare('no'))
    ctx.body = {
      ...returnConfig.default,
      total: resultList.length,
      data: resultList
    }
  },

  importData: async (ctx) => {
    try {
      const file = ctx.request.files.file // 获取上传文件
      const fileBuffer = fs.readFileSync(file.path)
      const dataObj = {}
      const errorRows = []
      const workbook = new Excel.Workbook()
      await workbook.xlsx.load(fileBuffer)
      workbook.eachSheet(worksheet => {
        const rowCount = worksheet.rowCount
        if (worksheet.name === '初赛成绩表') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            const errorMessage = []
            // console.log(rowData)
            if (rowData.length) {
              if (!rowData[2]) {
                errorMessage.push('缺少项目ID')
              }
              if (!rowData[5]) {
                errorMessage.push('缺少项目名称')
              }
              if (!rowData[6]) {
                errorMessage.push('缺少企业/团队名称')
              }
              if (!rowData[7]) {
                errorMessage.push('缺少负责人姓名')
              }
              if (!rowData[8]) {
                errorMessage.push('缺少负责人手机号')
              }
              if (errorMessage.length) {
                errorRows.push({ message: '第' + i + '行，' + errorMessage.join(',') + '。', rowData })
                continue
              }

              let finalScore = 0
              // const grades = [
              //   {
              //     name: rowData[9].toString(),
              //     value: rowData[10],
              //     comment: rowData[11].toString()
              //   },
              //   {
              //     name: rowData[12].toString(),
              //     value: rowData[13],
              //     comment: rowData[14].toString()
              //   },
              //   {
              //     name: rowData[15].toString(),
              //     value: rowData[16],
              //     comment: rowData[17].toString()
              //   },
              //   {
              //     name: rowData[18].toString(),
              //     value: rowData[19],
              //     comment: rowData[20].toString()
              //   },
              //   {
              //     name: rowData[21].toString(),
              //     value: rowData[22],
              //     comment: rowData[23].toString()
              //   },
              //   {
              //     name: rowData[24].toString(),
              //     value: rowData[25],
              //     comment: rowData[26].toString()
              //   },
              //   {
              //     name: rowData[27].toString(),
              //     value: rowData[28],
              //     comment: rowData[29].toString()
              //   },
              //   {
              //     name: rowData[30].toString(),
              //     value: rowData[31],
              //     comment: rowData[32].toString()
              //   },
              //   {
              //     name: rowData[33].toString(),
              //     value: rowData[34],
              //     comment: rowData[35].toString()
              //   },
              //   {
              //     name: rowData[36].toString(),
              //     value: rowData[37],
              //     comment: rowData[38].toString()
              //   }
              // ]

              // if (typeof rowData[18] === 'object') {
              //   rowData[18] = rowData[18].result || '-'
              // }

              // grades.forEach(grade => {
              //   if (+grade.value) {
              //     finalScore += 10
              //   }
              // })

              const grades = [
                (+rowData[9]).toFixed(1) || '',
                (+rowData[10]).toFixed(1) || '',
                (+rowData[11]).toFixed(1) || '',
                (+rowData[12]).toFixed(1) || '',
                (+rowData[13]).toFixed(1) || ''
              ]
              if (typeof rowData[14] === 'object') {
                finalScore = rowData[14].result ? (+rowData[14].result).toFixed(1) : ''
              } else {
                finalScore = rowData[14] ? (+rowData[14]).toFixed(1) : ''
              }

              dataObj[rowData[2]] = {
                no: rowData[1] || '', // 序号
                id: rowData[2].toString(), // 项目ID
                industry: (rowData[3] && rowData[3].toString()) || '-', // 赛道
                groupType: (rowData[4] && rowData[4].toString()) || '-', // 组别
                projectName: (rowData[5] && rowData[5].toString()) || '-', // 项目名称
                groupName: (rowData[6] && rowData[6].toString()) || '-', // 企业/团队名称
                directorName: (rowData[7] && rowData[7].toString()) || '-', // 负责人姓名
                directorMobile: (rowData[8] && rowData[8].toString()) || '-', // 负责人手机号
                preliminaryContest: {
                  grades, // 评分列表
                  finalScore, // 平均分
                  industryRanking: (rowData[15] && rowData[15].toString()) || '-', // 赛道排名
                  promotionResult: (rowData[16] && rowData[16].toString()) || '-' // 晋级结果
                }
              }
            }
          }
        }

        if (worksheet.name === '复赛成绩表') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            const errorMessage = []
            // console.log(rowData)
            if (rowData.length) {
              if (!rowData[2]) {
                errorMessage.push('缺少项目ID')
              }
              if (!rowData[5]) {
                errorMessage.push('缺少项目名称')
              }
              if (!rowData[6]) {
                errorMessage.push('缺少企业/团队名称')
              }
              if (!rowData[7]) {
                errorMessage.push('缺少负责人姓名')
              }
              if (!rowData[8]) {
                errorMessage.push('缺少负责人手机号')
              }
              if (errorMessage.length) {
                errorRows.push({ message: '第' + i + '行，' + errorMessage.join(',') + '。', rowData })
                continue
              }

              let finalScore = 0
              let industryRanking = 0

              const grades = [
                (+rowData[9]).toFixed(1) || '',
                (+rowData[10]).toFixed(1) || '',
                (+rowData[11]).toFixed(1) || '',
                (+rowData[12]).toFixed(1) || '',
                (+rowData[13]).toFixed(1) || ''
              ]
              if (typeof rowData[14] === 'object') {
                finalScore = rowData[14].result ? (+rowData[14].result).toFixed(1) : ''
              } else {
                finalScore = rowData[14] ? (+rowData[14]).toFixed(1) : ''
              }
              if (typeof rowData[15] === 'object') {
                industryRanking = rowData[15].result ? (+rowData[15].result).toFixed(1) : ''
              } else {
                industryRanking = rowData[15] ? (+rowData[15]).toFixed(1) : ''
              }

              dataObj[rowData[2]].semifinalsContest = {
                grades, // 评分列表
                finalScore, // 平均分
                industryRanking, // 赛道排名
                promotionResult: (rowData[16] && rowData[16].toString()) || '-' // 晋级结果
              }
            }
          }
        }

        if (worksheet.name === '决赛成绩表') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            const errorMessage = []
            // console.log(rowData)
            if (rowData.length) {
              if (!rowData[2]) {
                errorMessage.push('缺少项目ID')
              }
              if (!rowData[5]) {
                errorMessage.push('缺少项目名称')
              }
              if (!rowData[6]) {
                errorMessage.push('缺少企业/团队名称')
              }
              if (!rowData[7]) {
                errorMessage.push('缺少负责人姓名')
              }
              if (!rowData[8]) {
                errorMessage.push('缺少负责人手机号')
              }
              if (errorMessage.length) {
                errorRows.push({ message: '第' + i + '行，' + errorMessage.join(',') + '。', rowData })
                continue
              }

              let finalScore = 0
              let industryRanking = 0

              const grades = [
                (+rowData[9]).toFixed(1) || '',
                (+rowData[10]).toFixed(1) || '',
                (+rowData[11]).toFixed(1) || '',
                (+rowData[12]).toFixed(1) || '',
                (+rowData[13]).toFixed(1) || ''
              ]
              if (typeof rowData[14] === 'object') {
                finalScore = rowData[14].result ? (+rowData[14].result).toFixed(1) : ''
              } else {
                finalScore = rowData[14] ? (+rowData[14]).toFixed(1) : ''
              }
              if (typeof rowData[15] === 'object') {
                industryRanking = rowData[15].result ? (+rowData[15].result).toFixed(1) : ''
              } else {
                industryRanking = rowData[15] ? (+rowData[15]).toFixed(1) : ''
              }

              dataObj[rowData[2]].finalsContest = {
                grades, // 评分列表
                finalScore, // 平均分
                industryRanking, // 赛道排名
                promotionResult: (rowData[16] && rowData[16].toString()) || '-' // 晋级结果
              }
              dataObj[rowData[2]].prize = dataObj[rowData[2]].finalsContest.promotionResult
            }
          }
        }

        fs.writeFileSync(path.join(__dirname, '../data/data.json'), JSON.stringify(dataObj), { encoding: 'utf8' })
      })
      ctx.body = {
        ...returnConfig.default,
        errorRows
      }
    } catch (error) {
      console.error(error)
      ctx.body = returnConfig.serviceError
    }
  },

  heartBeat: async (ctx) => {
    if (ctx.session.username) {
      console.log('heartBeat: ' + ctx.session.username)
      ctx.body = {
        ...returnConfig.default
      }
    } else {
      ctx.body = {
        ...returnConfig.noLogin
      }
    }
  },

  loginPage: async ctx => {
    await ctx.render('login')
  },

  managementPage: async ctx => {
    await ctx.render('management')
  }
}
