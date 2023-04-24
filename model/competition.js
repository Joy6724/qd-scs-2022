'use strict'

const fs = require('fs')
const path = require('path')
const Excel = require('exceljs')
const send = require('koa-send')
const { returnConfig } = require('../config/index')
const { compare } = require('../utils/index')

module.exports = {
  // 获取赛事列表
  getCompetitionList: async (ctx) => {
    try {
      const resultList = []
      let dataObj = fs.readFileSync(path.join(__dirname, '../data/competition.json'), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.competitionList && dataObj.competitionList.length) {
        dataObj.competitionList.sort(compare('competitionId'))
      } else {
        dataObj = {}
        dataObj.competitionList = []
      }

      dataObj.competitionList && dataObj.competitionList.length && dataObj.competitionList.forEach(item => {
        if (item.state > 0) {
          if (item.hasDiffGroup) {
            item.industries && item.industries.length && item.industries.forEach((item2, index2) => {
              resultList.push({
                ...item,
                industry: {
                  index: index2,
                  name: item2.name
                }
              })
            })
          } else {
            resultList.push(item)
          }
        }
      })

      ctx.body = {
        ...returnConfig.default,
        total: resultList.length,
        data: resultList
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 添加赛事
  addCompetition: async (ctx) => {
    try {
      const competitionNew = ctx.request.body
      const resultList = []
      let dataObj = fs.readFileSync(path.join(__dirname, '../data/competition.json'), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.competitionList && dataObj.competitionList.length) {
        dataObj.competitionList.sort(compare('competitionId'))
        competitionNew.competitionId = dataObj.competitionList[dataObj.competitionList.length - 1].competitionId + 1
      } else {
        dataObj = {}
        dataObj.competitionList = []
        competitionNew.competitionId = 1
      }
      competitionNew.state = 1

      dataObj.competitionList.push(competitionNew)
      dataObj.competitionList.forEach(item => {
        if (item.state > 0) {
          if (item.hasDiffGroup) {
            item.industries && item.industries.length && item.industries.forEach((item2, index2) => {
              resultList.push({
                ...item,
                industry: {
                  index: index2,
                  name: item2.name
                }
              })
            })
          } else {
            resultList.push(item)
          }
        }
      })

      fs.writeFileSync(path.join(__dirname, '../data/competition.json'), JSON.stringify(dataObj), { encoding: 'utf8' })

      ctx.body = {
        ...returnConfig.default,
        total: resultList.length,
        data: resultList
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 删除赛事
  deleteCompetition: async (ctx) => {
    try {
      const competitionId = +ctx.params.id
      const resultList = []
      let dataObj = fs.readFileSync(path.join(__dirname, '../data/competition.json'), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.competitionList && dataObj.competitionList.length) {
        dataObj.competitionList.sort(compare('competitionId'))
      } else {
        dataObj = {}
        dataObj.competitionList = []
      }

      dataObj.competitionList && dataObj.competitionList.length && dataObj.competitionList.forEach(item => {
        if (item.competitionId === competitionId) {
          item.state = -1
        }
        if (item.state > 0) {
          if (item.hasDiffGroup) {
            item.industries && item.industries.length && item.industries.forEach((item2, index2) => {
              resultList.push({
                ...item,
                industry: {
                  index: index2,
                  name: item2.name
                }
              })
            })
          } else {
            resultList.push(item)
          }
        }
      })

      fs.writeFileSync(path.join(__dirname, '../data/competition.json'), JSON.stringify(dataObj), { encoding: 'utf8' })
      ctx.body = {
        ...returnConfig.default,
        total: resultList.length,
        data: resultList
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 导入参赛项目&评委信息
  importProject: async (ctx) => {
    try {
      const pathId = ctx.params.id
      const file = ctx.request.files.file // 获取上传文件
      const fileBuffer = fs.readFileSync(file.path)
      const dataObj = {
        project: {},
        judge: {}
      }
      const errorRows = []
      const workbook = new Excel.Workbook()

      await workbook.xlsx.load(fileBuffer)
      workbook.eachSheet(worksheet => {
        const rowCount = worksheet.rowCount
        if (worksheet.name === '项目信息') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            const errorMessage = []
            if (rowData.length) {
              if (!rowData[1]) {
                errorMessage.push('缺少项目ID')
              }
              if (!rowData[2]) {
                errorMessage.push('缺少项目名称')
              }
              if (!rowData[3]) {
                errorMessage.push('缺少企业/团队名称')
              }
              if (!rowData[4]) {
                errorMessage.push('缺少组别')
              }
              if (!rowData[5]) {
                errorMessage.push('缺少赛道')
              }
              if (rowData[1] in dataObj) {
                errorMessage.push('项目ID重复')
              }
              if (errorMessage.length) {
                errorRows.push({ message: '项目信息表：第' + i + '行，' + errorMessage.join(',') + '。', rowData })
                continue
              }

              dataObj.project[rowData[1]] = {
                projectId: rowData[1].toString(), // 项目ID
                projectName: (rowData[2] && rowData[2].toString()) || '-', // 项目名称
                groupName: (rowData[3] && rowData[3].toString()) || '-', // 企业/团队名称
                groupType: (rowData[2] && rowData[2].toString()) || '-', // 组别
                industry: (rowData[2] && rowData[2].toString()) || '-', // 赛道
                score: []
              }
            }
          }
        }

        if (worksheet.name === '评委信息') {
          for (let i = 2; i <= rowCount; i++) {
            const rowData = worksheet.getRow(i).values
            const errorMessage = []
            if (rowData.length) {
              if (!rowData[1]) {
                errorMessage.push('缺少评委ID')
              }
              if (!rowData[2]) {
                errorMessage.push('缺少评委姓名')
              }
              if (!rowData[3]) {
                errorMessage.push('缺少评委工作单位')
              }
              if (!rowData[4]) {
                errorMessage.push('缺少评委手机')
              }
              if (!rowData[5]) {
                errorMessage.push('缺少评委邮箱')
              }
              if (rowData[1] in dataObj) {
                errorMessage.push('评委ID重复')
              }
              if (errorMessage.length) {
                errorRows.push({ message: '评委信息表：第' + i + '行，' + errorMessage.join(',') + '。', rowData })
                continue
              }

              dataObj.judge[rowData[1]] = {
                judgeId: rowData[1].toString(), // 评委ID
                judgeName: (rowData[2] && rowData[2].toString()) || '-', // 评委名称
                work: (rowData[3] && rowData[3].toString()) || '-', // 工作单位
                phoneNumber: (rowData[4] && rowData[4].toString()) || '-', // 手机
                email: (rowData[5] && rowData[5].toString()) || '-' // 邮箱
              }
            }
          }
        }

        fs.writeFileSync(path.join(__dirname, `../data/competition_${pathId}.json`), JSON.stringify(dataObj), { encoding: 'utf8' })
        ctx.body = {
          ...returnConfig.default,
          errorRows
        }
      })
    } catch (error) {
      console.error(error)
      ctx.body = returnConfig.serviceError
    }
  },

  // 获取参赛项目&评委信息列表
  getProjectAndJudgeList: async (ctx) => {
    const pathId = ctx.params.id
    const projectList = []
    const judgeList = []

    try {
      let dataObj = fs.readFileSync(path.join(__dirname, `../data/competition_${pathId}.json`), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.project) {
        for (const key in dataObj.project) {
          const dataItem = dataObj.project[key]
          projectList.push(dataItem)
        }
      }
      if (dataObj && dataObj.judge) {
        for (const key in dataObj.judge) {
          const dataItem = dataObj.judge[key]
          judgeList.push(dataItem)
        }
      }

      ctx.body = {
        ...returnConfig.default,
        data: {
          projectList,
          judgeList
        }
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.notFound
      }
    }
  },

  // 获取参赛项目列表(含分数计算)
  getProjectList: async (ctx) => {
    const pathId = ctx.params.id
    const projectList = []

    fs.access(path.join(__dirname, `../data/competition_${pathId}.json`), fs.constants.F_OK, (err) => {
      console.log(err)
      ctx.body = {
        ...returnConfig.default,
        data: {
          projectList
        }
      }
      return false
    })
    let dataObj = fs.readFileSync(path.join(__dirname, `../data/competition_${pathId}.json`), { encoding: 'utf8' })

    dataObj = dataObj && JSON.parse(dataObj)

    if (dataObj && dataObj.project) {
      for (const key in dataObj.project) {
        const dataItem = dataObj.project[key]
        let finalScore = 0
        dataItem.score && dataItem.score.forEach(itemScore => {
          finalScore += itemScore.score
        })
        dataItem.finalScore = (finalScore / dataItem.score.length).toFixed(2)
        projectList.push(dataItem)
      }
    }

    ctx.body = {
      ...returnConfig.default,
      data: {
        projectList
      }
    }
  },

  // 获取评分规则
  getProjectRubric: async (ctx) => {
    const pathId = ctx.params.id

    const competitionIdGroup = pathId.split('-')
    const competitionId = +competitionIdGroup[0]
    let industryIndex = -1

    if (competitionIdGroup.length > 1) {
      industryIndex = +competitionIdGroup[1]
    }

    try {
      let dataObj = fs.readFileSync(path.join(__dirname, '../data/competition.json'), { encoding: 'utf8' })
      let flag = false

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.competitionList && dataObj.competitionList.length) {
        dataObj.competitionList.sort(compare('competitionId'))
      } else {
        dataObj = {}
        dataObj.competitionList = []
      }

      dataObj.competitionList.forEach(item => {
        if (item.competitionId === competitionId) {
          flag = true
          if (industryIndex > -1) {
            ctx.body = {
              ...returnConfig.default,
              data: item.industries[industryIndex].rubric
            }
          } else {
            ctx.body = {
              ...returnConfig.default,
              data: item.rubric
            }
          }
        }
      })
      if (!flag) {
        ctx.body = {
          ...returnConfig.notFound
        }
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 保存评分规则
  saveProjectRubric: async (ctx) => {
    const pathId = ctx.params.id
    const rubric = ctx.request.body

    const competitionIdGroup = pathId.split('-')
    const competitionId = +competitionIdGroup[0]
    let industryIndex = -1

    if (competitionIdGroup.length > 1) {
      industryIndex = +competitionIdGroup[1]
    }

    try {
      let dataObj = fs.readFileSync(path.join(__dirname, '../data/competition.json'), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      dataObj.competitionList.sort(compare('competitionId'))
      dataObj.competitionList.forEach(item => {
        if (item.competitionId === competitionId) {
          if (industryIndex > -1) {
            item.industries[industryIndex].rubric = rubric
          } else {
            item.rubric = rubric
          }
        }
      })

      fs.writeFileSync(path.join(__dirname, '../data/competition.json'), JSON.stringify(dataObj), { encoding: 'utf8' })

      ctx.body = {
        ...returnConfig.default
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 提交评分
  submitScoring: async (ctx) => {
    const scores = ctx.request.body
    const competitionId = scores.competitionId
    const judgeId = scores.judgeId
    const projectId = scores.projectId
    let score = 0

    scores && scores.scoringData && scores.scoringData.length && scores.scoringData.forEach(item => {
      if (item.hasChildren) {
        item.children && item.children.length && item.children.forEach(itemChild => {
          score += +itemChild.score
        })
      } else {
        score += +item.score
      }
    })

    try {
      let dataObj = fs.readFileSync(path.join(__dirname, `../data/competition_${competitionId}.json`), { encoding: 'utf8' })

      dataObj = dataObj && JSON.parse(dataObj)

      if (dataObj && dataObj.project) {
        for (const key in dataObj.project) {
          const dataItem = dataObj.project[key]
          let existScoreIndex = -1
          if (dataItem.projectId.toString() === projectId.toString()) {
            dataItem.score.forEach((itemScore, indexScore) => {
              if (itemScore.judgeId === judgeId) {
                existScoreIndex = indexScore
              }
            })
            if (existScoreIndex > -1) {
              dataItem.score[existScoreIndex] = {
                judgeId,
                score,
                scoreDetail: scores
              }
            } else {
              dataItem.score.push({
                judgeId,
                score,
                scoreDetail: scores
              })
            }
          }
        }
      }

      fs.writeFileSync(path.join(__dirname, `../data/competition_${competitionId}.json`), JSON.stringify(dataObj), { encoding: 'utf8' })
      ctx.body = {
        ...returnConfig.default
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  },

  // 导出成绩列表
  exportResult: async (ctx) => {
    const pathId = ctx.params.id
    const projectList = []
    let judgeCount = 1

    fs.access(path.join(__dirname, `../data/competition_${pathId}.json`), fs.constants.F_OK, (err) => {
      console.log(err)
      ctx.body = {
        ...returnConfig.serviceError
      }
      return false
    })
    let dataObj = fs.readFileSync(path.join(__dirname, `../data/competition_${pathId}.json`), { encoding: 'utf8' })

    dataObj = dataObj && JSON.parse(dataObj)
    judgeCount = dataObj && dataObj.judge && Object.keys(dataObj.judge).length

    if (dataObj && dataObj.project) {
      for (const key in dataObj.project) {
        const dataItem = dataObj.project[key]

        let finalScore = 0
        dataItem.score && dataItem.score.forEach((itemScore, indexScore) => {
          finalScore += itemScore.score
          dataItem['judge_' + indexScore] = itemScore.score
        })
        dataItem.finalScore = (finalScore / dataItem.score.length).toFixed(2)

        projectList.push(dataItem)
      }
    }

    const filePath = path.join(__dirname, '../data/')
    const fileName = new Date().getTime() + '.xlsx'
    const header = [
      { header: '项目ID', key: 'projectId', width: 10 },
      { header: '项目名称', key: 'projectName', width: 20 },
      { header: '企业/团队名称', key: 'groupName', width: 20 },
      { header: '组别', key: 'groupType', width: 20 },
      { header: '赛道', key: 'industry', width: 20 }
    ]
    for (let index = 0; index < judgeCount; index++) {
      header.push(
        { header: '评委' + (index + 1), key: 'judge_' + index, width: 10 }
      )
    }
    header.push({ header: '最终得分', key: 'finalScore', width: 10 })

    const options = {
      filename: filePath + fileName,
      useStyles: true,
      useSharedStrings: true
    }

    const workbook = new Excel.Workbook(options)
    const sheet = workbook.addWorksheet('sheet1')
    sheet.columns = header

    sheet.addRows(projectList)

    await workbook.xlsx.writeFile(filePath + fileName)

    const stats = fs.statSync(filePath + fileName)
    if (stats.isFile()) {
      ctx.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=' + fileName,
        'Content-Length': stats.size
      })
      ctx.body = fs.readFileSync(filePath + fileName, { encoding: 'binary' })
      await send(ctx, fileName, { root: filePath })

      return await workbook.xlsx.writeFile(filePath + fileName).then(async () => {
        ctx.attachment('成绩列表.xlsx')
        ctx.type = '.xlsx'
        ctx.body = fs.readFileSync(filePath + fileName)
      }, function (err) {
        console.log(err)
      })
    } else {
      ctx.body = {
        ...returnConfig.serviceError
      }
    }
  }
}
