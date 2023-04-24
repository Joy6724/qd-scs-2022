'use strict'

const Router = require('koa-router')
const competition = require('../model/competition')

const competitionRouter = new Router()

competitionRouter.get('/list', competition.getCompetitionList)
competitionRouter.post('/', competition.addCompetition)
competitionRouter.delete('/:id', competition.deleteCompetition)
competitionRouter.post('/import/:id', competition.importProject)
competitionRouter.get('/:id', competition.getProjectAndJudgeList)
competitionRouter.get('/project/:id', competition.getProjectList)
competitionRouter.get('/export/:id', competition.exportResult)
competitionRouter.get('/rubric/:id', competition.getProjectRubric)
competitionRouter.post('/rubric/:id', competition.saveProjectRubric)
competitionRouter.post('/:competitionId/:judgeId', competition.submitScoring)

module.exports = competitionRouter
