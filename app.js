#!/usr/bin/env node

/**
 * Module dependencies.
 */

var 
  express = require('express'),
  http = require('http'),
  path = require('path'),
  util = require('util'),
  combo = require('combo'),
  models = require('express-model'),
  routes = require('./routes'),
  handlers = require('./lib/handlers'),
  db = require('./lib/db')

var 
  app = express(),
  server, fn

app.configure(function() {

  app.set('port', process.env.PORT || 3000)
  app.set('view engine', 'jade')
  app.set('views', __dirname + '/views')
  app.set('root', __dirname)
  
  app.use(express.cookieParser('some secret here'))
  app.use(express.session())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.logger('dev'))
  app.use(express.static(__dirname + '/assets'))
  app.use(app.router)
  app.use(function(req, res, next) {
    if (!/\/$/.test(req.path))
      res.redirect(req.path + '/')
    else
      next()
  })

  app.get('/scripts/lib', combo.combine({rootPath: __dirname + '/assets/scripts/lib' }), function(req, res) {
    res.end(res.body)
  })
  app.get('/', routes.home)
  app.get('/settings/*', routes.settings)
  app.get('/go/*', routes.go)
  app.get('/login/', routes.login)
  app.get('/register/', routes.register)
  app.get('/extend/*', routes.extend)
  app.get('/:username/', routes.user)
  app.get('/:username/:kanID', routes.KAN)
  app.get('/:username/:kanID/:issue/', routes.issue)

  app.post('/api/*', routes.api)

  // route demos
  // - http://ikanbao.fm
  // - http://ikanbao.fm/settings/
  // - http://ikanbao.fm/store/
  // - http://ikanbao.fm/api/
  // - http://ikanbao.fm/go/
  // - http://ikanbao.fm/test/
  // - http://ikanbao.fm/login/
  // - http://ikanbao.fm/signup/
  // - http://ikanbao.fm/others/

  global.app = app;
  global.Models = models(__dirname + '/models')

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

/* 启动HTTP服务器 */
http.createServer(app).listen(app.get('port'), function() {
  console.log(util.format('Express server runs on PORT:%s,\n - Please press ENTER to stop the running server - !', app.get('port')))
})

/* 启动数据库服务器　*/
db.createServer()
