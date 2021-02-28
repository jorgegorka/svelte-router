const expect = require('chai').expect

const {
  anyEmptyNestedRoutes,
  compareRoutes,
  findLocalisedRoute,
  getNamedParams,
  getPathNames,
  nameToPath,
  pathWithQueryParams,
  pathWithoutQueryParams,
  removeSlash,
  routeNameLocalised,
  updateRoutePath,
} = require('../../src/lib/utils')

let pathNames = []
let namedParams = []
let routeName = ''
let emptyRoutes

describe('getPathNames', function () {
  describe('Home route', function () {
    beforeEach(function () {
      pathNames = getPathNames('/')
    })

    it('component', function () {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function () {
      expect(pathNames).to.include('/')
    })
  })

  describe('First level route', function () {
    beforeEach(function () {
      pathNames = getPathNames('contact-us')
    })

    it('component', function () {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function () {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('First level route', function () {
    beforeEach(function () {
      pathNames = getPathNames('/contact-us/')
    })

    it('component', function () {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function () {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('Two levels route', function () {
    beforeEach(function () {
      pathNames = getPathNames('contact-us/now')
    })

    it('should have 2 items', function () {
      expect(pathNames.length).to.equal(2)
    })

    it('should include route name', function () {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', function () {
      expect(pathNames).to.include('now')
    })
  })

  describe('Three levels route', function () {
    beforeEach(function () {
      pathNames = getPathNames('contact-us/now/PLEASE')
    })

    it('should have 2 items', function () {
      expect(pathNames.length).to.equal(3)
    })

    it('should include route name', function () {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', function () {
      expect(pathNames).to.include('now')
    })

    it('should include named param', function () {
      expect(pathNames).to.include('PLEASE')
    })
  })

  describe('Route with forward slash', function () {
    beforeEach(function () {
      pathNames = getPathNames('/contact-us/please')
    })

    it('should return one element', function () {
      expect(pathNames.length).to.equal(2)
    })

    it('should include the name', function () {
      expect(pathNames).to.include('contact-us')
    })

    it('should include the name', function () {
      expect(pathNames).to.include('please')
    })
  })
})

describe('compareRoutes', function () {
  describe('when route does not have a named param', function () {
    it('should return true if they are identical', function () {
      expect(compareRoutes('first/route', 'first/route')).to.be.true
    })

    it('should return false if they are different', function () {
      expect(compareRoutes('first/route', 'second/route')).to.be.false
    })

    it('should return true route includes all path names', function () {
      expect(compareRoutes('first/route', 'first/route/with/extra/info')).to.be.true
    })
  })

  describe('when route has a named param', function () {
    it('should return true if route includes the path name', function () {
      expect(compareRoutes('first/route', 'first/route/:id/other/stuff')).to.be.true
    })

    it('should return false if route does not include the path name', function () {
      expect(compareRoutes('first/route', 'second/route/:id/other/stuff')).to.be.false
    })
  })
})

describe('findLocalisedRoute', function () {
  let result

  describe('when route does not exist', function () {
    const pathName = 'admin'
    const route = { name: 'index' }
    const language = null

    beforeEach(function () {
      result = findLocalisedRoute(pathName, route, language)
    })

    it('should not exist', function () {
      expect(result.exists).to.be.false
    })

    it('should not set a default language', function () {
      expect(result.language).to.be.null
    })
  })

  describe('when route does exist', function () {
    let pathName = 'band/show'
    let route = { name: 'band/show' }
    let language = null

    beforeEach(function () {
      result = findLocalisedRoute(pathName, route, language)
    })

    describe('when language is not set', function () {
      it('should exist', function () {
        expect(result.exists).to.be.true
      })

      it('should not exist', function () {
        expect(result.language).to.be.null
      })

      describe('but a route name exists', function () {
        beforeEach(function () {
          pathName = 'grupo/mostrar'
          language = null
          route = { name: 'band/show', lang: { es: 'grupo/mostrar' } }
          result = findLocalisedRoute(pathName, route, language)
        })

        it('should exist', function () {
          expect(result.exists).to.be.true
        })

        it('should not exist', function () {
          expect(result.language).to.equal('es')
        })
      })
    })

    describe('when language is set', function () {
      beforeEach(function () {
        pathName = 'band/show'
        language = 'es'
        route = { name: 'band/show', lang: { es: 'grupo/mostrar' } }
        result = findLocalisedRoute(pathName, route, language)
      })

      it('should exist', function () {
        expect(result.exists).to.be.false
      })

      it('should not exist', function () {
        expect(result.language).to.equal(language)
      })
    })
  })
})

describe('getNamedParams', function () {
  describe('When there are no named params', function () {
    beforeEach(function () {
      namedParams = getNamedParams()
    })

    it('should return an empty object', function () {
      expect(namedParams).to.deep.equal([])
    })
  })

  describe('When there is one named param', function () {
    beforeEach(function () {
      namedParams = getNamedParams('/employee/:id')
    })

    it('should return one param', function () {
      expect(namedParams.length).to.equal(1)
    })

    it('should return the param name', function () {
      expect(namedParams).to.deep.equal(['id'])
    })
  })

  describe('When there are many params', function () {
    beforeEach(function () {
      namedParams = getNamedParams('/project/show/:name/:date/:id')
    })

    it('should return one param', function () {
      expect(namedParams.length).to.equal(3)
    })

    it('should return the param name', function () {
      expect(namedParams).to.deep.equal(['name', 'date', 'id'])
    })
  })

  describe('When there are params in the middle of the path', function () {
    beforeEach(function () {
      namedParams = getNamedParams('/project/show/:name/list')
    })

    it('should return one param', function () {
      expect(namedParams.length).to.equal(1)
    })

    it('should return the param name', function () {
      expect(namedParams).to.deep.equal(['name'])
    })
  })
})

describe('nameToPath', function () {
  describe('When is empty', function () {
    beforeEach(function () {
      routeName = nameToPath()
    })

    it('should be empty', function () {
      expect(routeName).to.equal('')
    })
  })

  describe('When is the root path', function () {
    beforeEach(function () {
      routeName = nameToPath('/')
    })

    it('should return the root path', function () {
      expect(routeName).to.equal('/')
    })
  })

  describe('When param has a named param', function () {
    beforeEach(function () {
      routeName = nameToPath('employee/:id')
    })

    it('should return the name', function () {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has many named params with it', function () {
    beforeEach(function () {
      routeName = nameToPath('employee/show/:id/:name')
    })

    it('should return the path up to the first named param', function () {
      expect(routeName).to.equal('employee/show')
    })
  })

  describe('When param has many named params ', function () {
    beforeEach(function () {
      routeName = nameToPath('employee/:name/show/:id')
    })

    it('should return the path up to the first named param', function () {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has one value', function () {
    beforeEach(function () {
      routeName = nameToPath('projects')
    })

    it('should return the path name', function () {
      expect(routeName).to.equal('projects')
    })
  })

  describe('When param has uppercase letters', function () {
    beforeEach(function () {
      routeName = nameToPath('proJECTS')
    })

    it('should return the path name downcased', function () {
      expect(routeName).to.equal('projects')
    })
  })
})

describe('anyEmptyNestedRoute', function () {
  describe('when there are empty nested routes', function () {
    beforeEach(function () {
      emptyRoutes = anyEmptyNestedRoutes({})
    })

    it('should return true', function () {
      expect(emptyRoutes).to.be.true
    })
  })

  describe('when there are no empty nested routes', function () {
    beforeEach(function () {
      emptyRoutes = anyEmptyNestedRoutes({
        name: 'bla',
        childRoute: { name: 'foo', childRoute: { name: 'pink' } },
      })
    })

    it('should return false', function () {
      expect(emptyRoutes).to.be.false
    })
  })

  describe('when there are empty nested routes', function () {
    beforeEach(function () {
      emptyRoutes = anyEmptyNestedRoutes({ name: 'bla', childRoute: { name: 'foo', childRoute: {} } })
    })

    it('should return true', function () {
      expect(emptyRoutes).to.be.true
    })
  })
})

describe('updateRoutePath', function () {
  let pathName = []
  let currentLanguage = null
  describe('when there are no nested routes', function () {
    describe('when route is one level', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin', pathName, { name: 'admin' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin')
      })
    })

    describe('when route is one level base path has a trailing slash', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('/admin', pathName, { name: 'admin' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin')
      })

      describe('and it needs to be converted', function () {
        beforeEach(function () {
          pathName = []
          routes = updateRoutePath('/setup', pathName, { name: 'setup', lang: { es: 'configuracion' } }, 'es', true)
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('configuracion')
        })
      })
    })
  })

  describe('when there are nested routes', function () {
    describe('when route is one level with trailing slash', function () {
      describe('when route does not need to be converted', function () {
        beforeEach(function () {
          pathName = ['teams', 'show', 'report']
          routes = updateRoutePath('admin', pathName, { name: '/admin' }, currentLanguage)
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('admin')
        })
      })

      describe('when route needs to be converted', function () {
        beforeEach(function () {
          pathName = ['teams', 'show', 'report']
          routes = updateRoutePath('admin', pathName, { name: 'admin', lang: { es: 'administrador' } }, 'es', true)
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('administrador')
        })
      })

      describe('when multi-route needs to be converted', function () {
        beforeEach(function () {
          pathName = ['teams', 'show', 'report']
          routes = updateRoutePath(
            'admin/teams/show/:id/report',
            pathName,
            { name: 'admin/teams/show/:id/report', lang: { es: 'admin/equipos/mostrar/:id/informe' } },
            'es',
            true
          )
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('admin/equipos/mostrar/:id/informe')
        })
      })
    })

    describe('when route is two levels', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin', pathName, { name: 'admin/teams' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin/teams')
      })
    })

    describe('when route is many levels deep', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin', pathName, { name: 'admin/teams/show/report' }, currentLanguage)
      })

      it('should return the base route 439', function () {
        expect(routes.result).to.equal('admin/teams/show/report')
      })
    })

    describe('when route is many levels deep but some levels unrelated', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin', pathName, { name: 'admin/invoices/show/report' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin')
      })
    })

    describe('when route is many levels deep but some levels unrelated', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin/employees', pathName, { name: 'admin/invoices/show/report' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin/employees')
      })
    })

    describe('when route is many levels deep but unrelated', function () {
      beforeEach(function () {
        pathName = ['teams', 'show', 'report']
        routes = updateRoutePath('admin', pathName, { name: 'other/employees/show/report' }, currentLanguage)
      })

      it('should return the base route', function () {
        expect(routes.result).to.equal('admin')
      })
    })

    describe('when language is set', function () {
      describe('a simple route', function () {
        beforeEach(function () {
          currentLanguage = 'de'
          pathName = ['kalender', 'show', 'report']
          routes = updateRoutePath(
            'kalender',
            pathName,
            { name: 'calendar', lang: { de: 'kalender', es: 'calendario' } },
            currentLanguage
          )
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('kalender')
        })
      })
    })

    describe('a multi route', function () {
      let pathName = ['kalender', 'edieren', 'report']
      describe('when language is set', function () {
        beforeEach(function () {
          routes = updateRoutePath(
            'kalender/edieren',
            pathName,
            { name: 'calendar/edit', lang: { de: 'kalender/edieren', es: 'calendario/modificar' } },
            'de'
          )
        })

        it('should return the base route', function () {
          expect(routes.result).to.equal('kalender/edieren')
        })
      })
    })
  })
})

describe('pathWithoutQueryParams', function () {
  let currentRoute = {}

  describe('when there are no query params', function () {
    beforeEach(function () {
      currentRoute.path = '/admin'
    })

    it('should return the base route', function () {
      expect(pathWithoutQueryParams(currentRoute)).to.equal('/admin')
    })
  })

  describe('when there are query params', function () {
    describe('when route has no segments', () => {
      beforeEach(function () {
        currentRoute.path = '/'
        currentRoute.queryParams = {
          date: '2019-11-21',
          employeeId: '1234324',
          ping: false,
        }
      })

      it('should return the base route', function () {
        expect(pathWithoutQueryParams(currentRoute)).to.equal('/')
      })
    })
    describe('when route has segments ending with a slash', () => {
      beforeEach(function () {
        currentRoute.path = '/admin/employee/new/'
        currentRoute.queryParams = {
          date: '2019-11-21',
          employeeId: '1234324',
          ping: false,
        }
      })

      it('should return the base route', function () {
        expect(pathWithoutQueryParams(currentRoute)).to.equal('/admin/employee/new/')
      })
    })
  })
})

describe('pathWithQueryParams', function () {
  let currentRoute = {}

  describe('when there are no query params', function () {
    beforeEach(function () {
      currentRoute.path = '/admin'
    })

    it('should return the base route', function () {
      expect(pathWithQueryParams(currentRoute)).to.equal('/admin')
    })
  })

  describe('when there are query params', function () {
    beforeEach(function () {
      currentRoute.path = '/admin/employee/new'
      currentRoute.queryParams = {
        date: '2019-11-21',
        employeeId: '1234324',
        ping: false,
      }
    })

    it('should return the base route with the params', function () {
      expect(pathWithQueryParams(currentRoute)).to.equal(
        '/admin/employee/new?date=2019-11-21&employeeId=1234324&ping=false'
      )
    })
  })

  describe('when query params are empty', function () {
    beforeEach(function () {
      currentRoute.path = '/admin/employee/new'
      currentRoute.queryParams = {}
    })

    it('should return the base route', function () {
      expect(pathWithQueryParams(currentRoute)).to.equal('/admin/employee/new')
    })
  })

  describe('when there are query params and a hash', function () {
    beforeEach(function () {
      currentRoute.path = '/admin/employee/new'
      currentRoute.queryParams = {
        date: '2019-11-21',
        employeeId: '1234324',
        ping: false,
      }
      currentRoute.hash = '#article'
    })

    it('should return the base route with the params', function () {
      expect(pathWithQueryParams(currentRoute)).to.equal(
        '/admin/employee/new?date=2019-11-21&employeeId=1234324&ping=false#article'
      )
    })
  })
})

describe('removeSlash', function () {
  let word = '/example/route/'

  describe('when there is no slash', function () {
    it('should return the word unchanged', function () {
      expect(removeSlash('example/route')).to.equal('example/route')
    })
  })

  describe('when position is lead ', function () {
    it('should return the word without leading slash', function () {
      expect(removeSlash(word, 'lead')).to.equal('example/route/')
    })
  })

  describe('when position is trail ', function () {
    it('should return the word without trailing slash', function () {
      expect(removeSlash(word, 'trail')).to.equal('/example/route')
    })
  })

  describe('when position is both ', function () {
    it('should return the word without leading and trailing slash', function () {
      expect(removeSlash(word, 'both')).to.equal('example/route')
    })
  })
})

describe('routeNameLocalised', function () {
  let currentRoute = { name: 'employees', lang: { de: 'kalender', es: 'calendario' } }
  let currentLanguage = 'default'

  describe('when language is default', function () {
    it('should return the default route name', function () {
      expect(routeNameLocalised(currentRoute, currentLanguage)).to.equal('employees')
    })
  })

  describe('when language is not default', function () {
    beforeEach(function () {
      currentLanguage = 'de'
    })

    it('should return the language route name', function () {
      expect(routeNameLocalised(currentRoute, currentLanguage)).to.equal('kalender')
    })
  })
})
