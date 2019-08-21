const expect = require('chai').expect

const {
  addAbsoluteRoutes,
  anyEmptyNestedRoutes,
  compareRoutes,
  getPathNames,
  getNamedParams,
  nameToPath,
  routeExists
} = require('../../src/lib/utils')

let pathNames = []
let namedParams = []
let routeName = ''
let emptyRoutes

describe('addAbsoluteRoutes', function() {
  beforeEach(function() {
    const routes = [
      {
        name: '/',
        component: 'PublicIndex'
      },
      { name: 'login', component: 'Login' },
      { name: 'signup', component: 'SignUp' },
      {
        name: 'admin',
        component: 'AdminIndex',
        nestedRoutes: [
          {
            name: 'employees',
            component: 'EmployeesIndex'
          },
          {
            name: 'employees/show/:id',
            component: 'ShowEmployee'
          },
          {
            name: 'employees/show/:id/list',
            component: 'ListEmployee'
          },
          {
            name: 'teams',
            component: 'TeamsIndex'
          },
          {
            name: 'teams/active',
            component: 'ActiveTeams'
          },
          {
            name: 'teams/show/:name',
            component: 'ShowTeams'
          }
        ]
      }
    ]
    absoluteRoutes = addAbsoluteRoutes(routes)
    nestedAdmin = absoluteRoutes[3].nestedRoutes
  })

  it('should return an array', function() {
    expect(absoluteRoutes).to.be.an('array')
  })

  it('should return the full route for basic routes', function() {
    expect(absoluteRoutes[0].fullPath).to.equal('/')
    expect(absoluteRoutes[1].fullPath).to.equal('/login')
    expect(absoluteRoutes[2].fullPath).to.equal('/signup')
    expect(absoluteRoutes[3].fullPath).to.equal('/admin')
  })

  it('should return the full name of nested routes', function() {
    expect(absoluteRoutes[4].fullPath).to.equal('/admin/employees')
    expect(absoluteRoutes[5].fullPath).to.equal('/admin/employees/show/:id')
    expect(absoluteRoutes[6].fullPath).to.equal('/admin/employees/show/:id/list')
  })
})

describe('compareRoutes', function() {
  let basePath = ['/']
  let routePath = ['/']

  describe('when basePath is home route', function() {
    describe('when route path is an empty array', function() {
      it('should return true if base path is home route', function() {
        expect(compareRoutes(basePath, routePath)).to.be.true
      })
    })

    describe('when route path is an empty string', function() {
      beforeEach(function() {
        routePath = ['']
      })

      it('should return false', function() {
        expect(compareRoutes(basePath, routePath)).to.be.false
      })
    })
  })

  describe('when basePath is not home route', function() {
    beforeEach(function() {
      basePath = ['admin']
    })

    describe('when route path is an empty array', function() {
      it('should return true if base path is home route', function() {
        expect(compareRoutes(basePath, routePath)).to.be.false
      })
    })

    describe('when route path is an empty string', function() {
      beforeEach(function() {
        routePath = ['']
      })

      it('should return true if base path is home route', function() {
        expect(compareRoutes(basePath, routePath)).to.be.false
      })
    })
  })

  describe('when basePath is multi level', function() {
    describe('when there are placeholders', function() {
      beforeEach(function() {
        basePath = ['admin', 'employees']
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees'])).to.be.true
      })
    })

    describe('when there are placeholders', function() {
      beforeEach(function() {
        basePath = ['admin', ':employees']
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees'])).to.be.true
      })
    })

    describe('when there placeholders at the end of the path', function() {
      beforeEach(function() {
        basePath = ['admin', 'employees', 'show', ':id']
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show'])).to.be.true
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show', 'joker'])).to.be.true
      })
    })

    describe('when there placeholders in the middle of the path', function() {
      beforeEach(function() {
        basePath = ['admin', 'employees', 'show', ':id', 'list']
      })

      it('should return false if they are not equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show'])).to.be.false
      })

      it('should return false if they are not equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show', 'joker', 'print'])).to.be.false
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show', 'joker', 'list'])).to.be.true
      })
    })

    describe('when there placeholders in the middle of the path', function() {
      beforeEach(function() {
        basePath = ['admin', 'employees', 'show', ':id', ':name']
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show'])).to.be.true
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show', '123'])).to.be.true
      })

      it('should return true if they are equal', function() {
        expect(compareRoutes(basePath, ['admin', 'employees', 'show', '123', 'batman'])).to.be.true
      })
    })
  })
})

describe('routeExists', function() {
  let routes = [
    { name: '/', component: 'PublicIndex', fullPath: '/' },
    { name: 'login', component: 'Login', fullPath: '/login' },
    { name: 'signup', component: 'SignUp', fullPath: '/signup' },
    { name: 'admin', component: 'AdminIndex', nestedRoutes: [[1], [2]], fullPath: '/admin' },
    { name: 'employees', component: 'EmployeesIndex', fullPath: '/admin/employees' },
    { name: 'employees/show/:id', component: 'ShowEmployee', fullPath: '/admin/employees/show/:id' },
    { name: 'employees/show/:id/list', component: 'ListEmployee', fullPath: '/admin/employees/show/:id/list' },
    { name: 'teams', component: 'TeamsIndex', fullPath: '/admin/teams' },
    { name: 'teams/active', component: 'ActiveTeams', fullPath: '/admin/teams/active' },
    { name: 'teams/show/:name', component: 'ShowTeams', fullPath: '/admin/teams/show/:name' },
    { name: 'static/route/path', component: 'StaticRoute', fullPath: '/static/route/path' }
  ]

  describe('for first level routes', function() {
    it('return false if route does not exist', function() {
      expect(routeExists(routes, ['pepe'])).to.be.false
    })

    it('return home if route is home', function() {
      expect(routeExists(routes, ['/'])).to.deep.equal({ name: '/', component: 'PublicIndex', fullPath: '/' })
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['login'])).to.deep.equal({ name: 'login', component: 'Login', fullPath: '/login' })
    })
  })

  describe('for multi level routes', function() {
    it('return false if route does not exist', function() {
      expect(routeExists(routes, ['admin', 'batman'])).to.be.false
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['admin', 'teams'])).to.deep.equal({
        name: 'teams',
        component: 'TeamsIndex',
        fullPath: '/admin/teams'
      })
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['admin', 'teams', 'active'])).to.deep.equal({
        name: 'teams/active',
        component: 'ActiveTeams',
        fullPath: '/admin/teams/active'
      })
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['static', 'route', 'path'])).to.deep.equal({
        name: 'static/route/path',
        component: 'StaticRoute',
        fullPath: '/static/route/path'
      })
    })
  })

  describe('for multi level routes with named params', function() {
    it('return false if route does not exist', function() {
      expect(routeExists(routes, ['admin', 'employees', 'show', 'batman', 'robin'])).to.be.false
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['admin', 'employees', 'show'])).to.to.deep.equal({
        name: 'employees/show/:id',
        component: 'ShowEmployee',
        fullPath: '/admin/employees/show/:id'
      })
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['admin', 'employees', 'show', 'batman'])).to.to.deep.equal({
        name: 'employees/show/:id',
        component: 'ShowEmployee',
        fullPath: '/admin/employees/show/:id'
      })
    })

    it('return true if route exists', function() {
      expect(routeExists(routes, ['admin', 'employees', 'show', 'batman', 'list'])).to.be.true
    })
  })
})

describe('getPathNames', function() {
  describe('Home route', function() {
    beforeEach(function() {
      pathNames = getPathNames('/')
    })

    it('component', function() {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function() {
      expect(pathNames).to.include('/')
    })
  })

  describe('First level route', function() {
    beforeEach(function() {
      pathNames = getPathNames('contact-us')
    })

    it('component', function() {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function() {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('First level route', function() {
    beforeEach(function() {
      pathNames = getPathNames('/contact-us/')
    })

    it('component', function() {
      expect(pathNames.length).to.equal(1)
    })

    it('component', function() {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('Two levels route', function() {
    beforeEach(function() {
      pathNames = getPathNames('contact-us/now')
    })

    it('should have 2 items', function() {
      expect(pathNames.length).to.equal(2)
    })

    it('should include route name', function() {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', function() {
      expect(pathNames).to.include('now')
    })
  })

  describe('Three levels route', function() {
    beforeEach(function() {
      pathNames = getPathNames('contact-us/now/PLEASE')
    })

    it('should have 2 items', function() {
      expect(pathNames.length).to.equal(3)
    })

    it('should include route name', function() {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', function() {
      expect(pathNames).to.include('now')
    })

    it('should include named param', function() {
      expect(pathNames).to.include('PLEASE')
    })
  })

  describe('Route with forward slash', function() {
    beforeEach(function() {
      pathNames = getPathNames('/contact-us/please')
    })

    it('should return one element', function() {
      expect(pathNames.length).to.equal(2)
    })

    it('should include the name', function() {
      expect(pathNames).to.include('contact-us')
    })

    it('should include the name', function() {
      expect(pathNames).to.include('please')
    })
  })
})

describe('getNamedParams', function() {
  describe('When there are no named params', function() {
    beforeEach(function() {
      namedParams = getNamedParams()
    })

    it('should return an empty object', function() {
      expect(namedParams).to.deep.equal([])
    })
  })

  describe('When there is one named param', function() {
    beforeEach(function() {
      namedParams = getNamedParams('/employee/:id')
    })

    it('should return one param', function() {
      expect(namedParams.length).to.equal(1)
    })

    it('should return the param name', function() {
      expect(namedParams).to.deep.equal(['id'])
    })
  })

  describe('When there are many params', function() {
    beforeEach(function() {
      namedParams = getNamedParams('/project/show/:name/:date/:id')
    })

    it('should return one param', function() {
      expect(namedParams.length).to.equal(3)
    })

    it('should return the param name', function() {
      expect(namedParams).to.deep.equal(['name', 'date', 'id'])
    })
  })
})

describe('nameToPath', function() {
  describe('When is empty', function() {
    beforeEach(function() {
      routeName = nameToPath()
    })

    it('component', function() {
      expect(routeName).to.equal('')
    })
  })

  describe('When is the root path', function() {
    beforeEach(function() {
      routeName = nameToPath('/')
    })

    it('component', function() {
      expect(routeName).to.equal('/')
    })
  })

  describe('When param has a named param', function() {
    beforeEach(function() {
      routeName = nameToPath('employee/:id')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has many named params with it', function() {
    beforeEach(function() {
      routeName = nameToPath('employee/show/:id/:name')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('employee/show')
    })
  })

  describe('When param has many named params ', function() {
    beforeEach(function() {
      routeName = nameToPath('employee/:name/show/:id')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has one value', function() {
    beforeEach(function() {
      routeName = nameToPath('projects')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('projects')
    })
  })

  describe('When param has uppercase letters', function() {
    beforeEach(function() {
      routeName = nameToPath('proJECTS')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('projects')
    })
  })

  describe('When param has named params with it', function() {
    beforeEach(function() {
      routeName = nameToPath('employee/:id')
    })

    it('should return the name', function() {
      expect(routeName).to.equal('employee')
    })
  })
})

describe('anyEmptyNestedRoute', function() {
  describe('when there are empty nested routes', function() {
    beforeEach(function() {
      emptyRoutes = anyEmptyNestedRoutes({})
    })

    it('should return true', function() {
      expect(emptyRoutes).to.be.true
    })
  })

  describe('when there are no empty nested routes', function() {
    beforeEach(function() {
      emptyRoutes = anyEmptyNestedRoutes({
        name: 'bla',
        childRoute: { name: 'foo', childRoute: { name: 'pink' } }
      })
    })

    it('should return false', function() {
      expect(emptyRoutes).to.be.false
    })
  })

  describe('when there are empty nested routes', function() {
    beforeEach(function() {
      emptyRoutes = anyEmptyNestedRoutes({ name: 'bla', childRoute: { name: 'foo', childRoute: {} } })
    })

    it('should return true', function() {
      expect(emptyRoutes).to.be.true
    })
  })
})

// describe('compareRoutes', function() {
//   let pathName = []
//   describe('when there are no nested routes', function() {
//     describe('when route is one level', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: 'admin' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })

//     describe('when route is one level', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('/admin', pathName, { name: 'admin' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })
//   })

//   describe('when there are nested routes', function() {
//     describe('when route is one level with /', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: '/admin' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })

//     describe('when route is two levels', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: 'admin/teams' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin/teams')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['show', 'report'])
//       })
//     })

//     describe('when route is many levels deep', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: 'admin/teams/show/report' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin/teams/show/report')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal([])
//       })
//     })

//     describe('when route is many levels deep but some levels unrelated', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: 'admin/invoices/show/report' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })

//     describe('when route is many levels deep but some levels unrelated', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin/employees', pathName, { name: 'admin/invoices/show/report' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin/employees')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })

//     describe('when route is many levels deep but unrelated', function() {
//       beforeEach(function() {
//         pathName = ['teams', 'show', 'report']
//         routes = compareRoutes('admin', pathName, { name: 'other/employees/show/report' })
//       })

//       it('should return the base route', function() {
//         expect(routes).to.equal('admin')
//       })

//       it('should return the route name', function() {
//         expect(pathName).to.deep.equal(['teams', 'show', 'report'])
//       })
//     })
//   })
// })
