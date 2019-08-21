const expect = require('chai').expect

const {
  anyEmptyNestedRoutes,
  compareRoutes,
  getNamedParams,
  getPathNames,
  nameToPath,
  pathWithSearch
} = require('../../src/lib/utils')

let pathNames = []
let namedParams = []
let routeName = ''
let emptyRoutes

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

describe('compareRoutes', function() {
  let pathName = []
  describe('when there are no nested routes', function() {
    describe('when route is one level', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is one level', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('/admin', pathName, { name: 'admin' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })
  })

  describe('when there are nested routes', function() {
    describe('when route is one level with /', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: '/admin' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is two levels', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/teams' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin/teams')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['show', 'report'])
      })
    })

    describe('when route is many levels deep', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/teams/show/report' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin/teams/show/report')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal([])
      })
    })

    describe('when route is many levels deep but some levels unrelated', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/invoices/show/report' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is many levels deep but some levels unrelated', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin/employees', pathName, { name: 'admin/invoices/show/report' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin/employees')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is many levels deep but unrelated', function() {
      beforeEach(function() {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'other/employees/show/report' })
      })

      it('should return the base route', function() {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', function() {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })
  })
})

describe('pathWithSearch', function() {
  let currentRoute = {}

  describe('when there are no query params', function() {
    beforeEach(function() {
      currentRoute.path = '/admin'
    })

    it('should return the base route', function() {
      expect(pathWithSearch(currentRoute)).to.equal('/admin')
    })
  })

  describe('when there are query params', function() {
    beforeEach(function() {
      currentRoute.path = '/admin/employee/new'
      currentRoute.queryParams = {
        date: '2019-11-21',
        employeeId: '1234324',
        ping: false
      }
    })

    it('should return the base route', function() {
      expect(pathWithSearch(currentRoute)).to.equal('/admin/employee/new?date=2019-11-21&employeeId=1234324&ping=false')
    })
  })

  describe('when query params are empty', function() {
    beforeEach(function() {
      currentRoute.path = '/admin/employee/new'
      currentRoute.queryParams = {}
    })

    it('should return the base route', function() {
      expect(pathWithSearch(currentRoute)).to.equal('/admin/employee/new')
    })
  })
})
