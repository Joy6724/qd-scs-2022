'use strict'

const path = require('path')
const Koa = require('koa')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const log4js = require('koa-log4')
const config = require('./config/index')
const koaBody = require('koa-body')
const views = require('koa-views')
const server = require('koa-static')

const app = new Koa()
const rootRouter = require('./routes/index')

app.keys = config.appKeys

app.use(server(path.join(__dirname, '/public')))

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:2023')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type')
  ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE')
  await next()
})

app.use(views('views', { map: { html: 'ejs' } }))

app.use(session({
  key: config.sessionKey,
  maxAge: config.maxAge,
  rolling: true
}, app))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
  }
}))

app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))

app.use(bodyParser())

app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(rootRouter.routes())

app.use(rootRouter.allowedMethods())

app.on('error', (err, ctx) => {
  console.error({
    message: 'server error',
    err,
    ctx
  })
  ctx.body = {
    code: 500,
    message: '服务器错误'
  }
})

app.listen(config.port)
