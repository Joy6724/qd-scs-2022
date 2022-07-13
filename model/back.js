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
      const workbook = new Excel.Workbook()
      await workbook.xlsx.load(fileBuffer)
      workbook.eachSheet(worksheet => {
        const rowCount = worksheet.rowCount
        if (worksheet.name === '初赛成绩表') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            // console.log(rowData)
            if (rowData.length && rowData[2]) {
              // let finalScore = 0
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

              const grades = [rowData[9], rowData[10], rowData[11], rowData[12], rowData[13]]

              // if (typeof rowData[18] === 'object') {
              //   rowData[18] = rowData[18].result || '-'
              // }

              // grades.forEach(grade => {
              //   if (+grade.value) {
              //     finalScore += 10
              //   }
              // })

              dataObj[rowData[2]] = {
                no: rowData[1], // 序号
                id: rowData[2].toString(), // 项目ID
                industry: rowData[3].toString(), // 赛道
                groupType: rowData[4].toString(), // 组别
                projectName: rowData[5].toString(), // 项目名称
                groupName: rowData[6].toString(), // 企业/团队名称
                directorName: rowData[7].toString(), // 负责人姓名
                directorMobile: rowData[8].toString(), // 负责人手机号
                preliminaryContest: {
                  grades, // 评分列表
                  finalScore: (typeof rowData[14] === 'object') ? rowData[14].result || 0 : rowData[14], // 平均分
                  industryRanking: rowData[15].toString(), // 赛道排名
                  promotionResult: rowData[16].toString() // 晋级结果
                }
              }
            }
          }
        }

        // if (worksheet.name === '复赛成绩表') {
        //   for (let i = 2; i <= rowCount; i++) {
        //     const rowData = worksheet.getRow(i).values
        //     console.log(rowData)
        //     if (dataObj[rowData[2]] && rowData.length) {
        //       if (typeof rowData[13] === 'object') {
        //         rowData[13] = +rowData[13].result || '-'
        //       }
        //       dataObj[rowData[2]].semifinalsContest = {
        //         grades: [
        //           {
        //             name: rowData[3].toString(),
        //             value: rowData[4]
        //           },
        //           {
        //             name: rowData[5].toString(),
        //             value: rowData[6]
        //           },
        //           {
        //             name: rowData[7].toString(),
        //             value: rowData[8]
        //           },
        //           {
        //             name: rowData[9].toString(),
        //             value: rowData[10]
        //           },
        //           {
        //             name: rowData[11].toString(),
        //             value: rowData[12]
        //           }
        //         ],
        //         finalScore: rowData[13],
        //         ranking: rowData[14].toString()
        //       }
        //     }
        //   }
        // }

        // if (worksheet.name === '决赛成绩表') {
        //   for (let i = 2; i <= rowCount; i++) {
        //     const rowData = worksheet.getRow(i).values
        //     console.log(rowData)
        //     if (dataObj[rowData[2]] && rowData.length) {
        //       if (typeof rowData[17] === 'object') {
        //         rowData[17] = +rowData[17].result || '-'
        //       }
        //       dataObj[rowData[2]].finalsContest = {
        //         grades: [
        //           {
        //             name: rowData[3].toString(),
        //             value: rowData[4]
        //           },
        //           {
        //             name: rowData[5].toString(),
        //             value: rowData[6]
        //           },
        //           {
        //             name: rowData[7].toString(),
        //             value: rowData[8]
        //           },
        //           {
        //             name: rowData[9].toString(),
        //             value: rowData[10]
        //           },
        //           {
        //             name: rowData[11].toString(),
        //             value: rowData[12]
        //           },
        //           {
        //             name: rowData[13].toString(),
        //             value: rowData[14]
        //           },
        //           {
        //             name: rowData[15].toString(),
        //             value: rowData[16]
        //           }
        //         ],
        //         finalScore: rowData[17],
        //         ranking: rowData[18].toString()
        //       }
        //       dataObj[rowData[2]].prize = rowData[19].toString()
        //     }
        //   }
        // }

        fs.writeFileSync(path.join(__dirname, '../data/data.json'), JSON.stringify(dataObj), { encoding: 'utf8' })
      })
      ctx.body = returnConfig.default
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
