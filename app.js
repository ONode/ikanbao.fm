
/**
 * Module dependencies.
 */

var 
  express = require('express'),
  path = require('path'),
  util = require('util'),
  combo = require('combo'),
  models = require('express-model'),
  routes = require('./routes'),
  auth = require('./lib/auth'),
  bootstrap = require('./lib/bootstrap'),
  route_map = require('./lib/route-map')

var 
  app = express(),
  server, fn

app.configure(function() {

  route_map(app)
  app.set('port', process.env.PORT || 3000)
  app.set('view engine', 'jade')
  app.set('views', __dirname + '/views')
  app.set('root', __dirname)
  
  app.use(express.cookieParser())
  app.use(express.session({ secret: 'htuayreve'}))
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/assets/upload-files/tmp' }))
  app.use(express.methodOverride())
  app.use(express.logger('dev'))
  app.use(express.static(__dirname + '/assets'))
  
  app.use(localsHandler)
  app.use(filterHandler)
  app.use(auth.middleware())
  app.use(afterAuthenticatedHandler)

  function filterHandler(req, res, next) {
    if (req.url == '/login')
      res.redirect('/login/')
    if (req.url == '/login/')
      res.locals.page.title = '登陆 - ikanbao.fm'
    if (req.url == '/register')
      res.redirect('/register/')
    if (req.url == '/register/')
      res.locals.page.title = '注册 - ikanbao.fm'
    next()
  }

  function localsHandler(req, res, next) {
    res.locals.loginFormFieldName = auth.password.loginFormFieldName()
    res.locals.passwordFormFieldName = auth.password.passwordFormFieldName()
    res.locals.user = { isAuthenticated: false }
    res.locals.page = {
      'title': '爱看报(iKanbao.fm)'
    }
    next()
  }

  function afterAuthenticatedHandler(req, res, next) {
    if (req.user) {
      res.locals.user = req.user
    }
    next()
  }

  app.use(app.router)
  app.all('/api/:api/*', routes.api)

  app.get('/scripts/?', combo.combine({ rootPath: __dirname + '/assets/scripts' }), function(req, res) {
    res.end(res.body)
  })
  app.get('/scripts/lib/?', combo.combine({ rootPath: __dirname + '/assets/scripts/lib' }), function(req, res) {
    res.end(res.body)
  })
  app.get('/scripts/lib/ueditor/?', combo.combine({ rootPath: __dirname + '/assets/scripts/lib/ueditor' }), function(req, res) {
    res.end(res.body)
  })
  app.get('/scripts/utils/?', combo.combine({ rootPath: __dirname + '/assets/scripts/utils' }), function(req, res) {
    res.end(res.body)
  })
  app.get('/scripts/widgets/?', combo.combine({ rootPath: __dirname + '/assets/scripts/widgets' }), function(req, res) {
    res.end(res.body)
  })

  app.map({
    '/': {
      get: routes.home
    },
    '/history': {
      get: routes.history
    },
    '/groups': {
      get: routes.groups
    },
    '/settings': {
      get: routes.settings
    },
    '/post/:type': {
      get: routes.post
    },
    '/go': {
      get: routes.go
    },
    '/post': {
      get: routes._404  // potential risk
    }
  })

  app.map({
    '/pages':{
      '/404': {
        get: routes.pages['404']
      }
    }
  })

  app.map({
    '/:username': {
      get: routes.user,
      '/kan': {
        get: routes.user
      },
      '/subscribe': {
        get: routes.user
      },
      '/:kanId': {
        get: routes.KAN,
        '/:issue*': {
          get: routes.issue
        }
      }
    }
  })

  global.app = app;
  global.Models = models(__dirname + '/models')

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

// 启动其他服务
bootstrap.init()
