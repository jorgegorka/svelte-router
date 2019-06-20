const expect = require('chai').expect
const getPathNames = require('../../src/lib/utils').getPathNames
const getNamedParams = require('../../src/lib/utils').getNamedParams
const nameToPath = require('../../src/lib/utils').nameToPath
const anyEmptyNestedRoutes = require('../../src/lib/utils').anyEmptyNestedRoutes
const compareRoutes = require('../../src/lib/utils').compareRoutes

let pathNames = []
let namedParams = []
let routeName = ''
let emptyRoutes

describe('getPathNames', () => {
  describe('Home route', () => {
    beforeEach(() => {
      pathNames = getPathNames('/')
    })

    it('component', () => {
      expect(pathNames.length).to.equal(1)
    })

    it('component', () => {
      expect(pathNames).to.include('/')
    })
  })

  describe('First level route', () => {
    beforeEach(() => {
      pathNames = getPathNames('contact-us')
    })

    it('component', () => {
      expect(pathNames.length).to.equal(1)
    })

    it('component', () => {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('First level route', () => {
    beforeEach(() => {
      pathNames = getPathNames('/contact-us/')
    })

    it('component', () => {
      expect(pathNames.length).to.equal(1)
    })

    it('component', () => {
      expect(pathNames).to.include('contact-us')
    })
  })

  describe('Two levels route', () => {
    beforeEach(() => {
      pathNames = getPathNames('contact-us/now')
    })

    it('should have 2 items', () => {
      expect(pathNames.length).to.equal(2)
    })

    it('should include route name', () => {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', () => {
      expect(pathNames).to.include('now')
    })
  })

  describe('Three levels route', () => {
    beforeEach(() => {
      pathNames = getPathNames('contact-us/now/PLEASE')
    })

    it('should have 2 items', () => {
      expect(pathNames.length).to.equal(3)
    })

    it('should include route name', () => {
      expect(pathNames).to.include('contact-us')
    })

    it('should include named param', () => {
      expect(pathNames).to.include('now')
    })

    it('should include named param', () => {
      expect(pathNames).to.include('PLEASE')
    })
  })

  describe('Route with forward slash', () => {
    beforeEach(() => {
      pathNames = getPathNames('/contact-us/please')
    })

    it('should return one element', () => {
      expect(pathNames.length).to.equal(2)
    })

    it('should include the name', () => {
      expect(pathNames).to.include('contact-us')
    })

    it('should include the name', () => {
      expect(pathNames).to.include('please')
    })
  })
})

describe('getNamedParams', () => {
  describe('When there are no named params', () => {
    beforeEach(() => {
      namedParams = getNamedParams()
    })

    it('should return an empty object', () => {
      expect(namedParams).to.deep.equal([])
    })
  })

  describe('When there is one named param', () => {
    beforeEach(() => {
      namedParams = getNamedParams('/employee/:id')
    })

    it('should return one param', () => {
      expect(namedParams.length).to.equal(1)
    })

    it('should return the param name', () => {
      expect(namedParams).to.deep.equal(['id'])
    })
  })

  describe('When there are many params', () => {
    beforeEach(() => {
      namedParams = getNamedParams('/project/show/:name/:date/:id')
    })

    it('should return one param', () => {
      expect(namedParams.length).to.equal(3)
    })

    it('should return the param name', () => {
      expect(namedParams).to.deep.equal(['name', 'date', 'id'])
    })
  })
})

describe('nameToPath', () => {
  describe('When is empty', () => {
    beforeEach(() => {
      routeName = nameToPath()
    })

    it('component', () => {
      expect(routeName).to.equal('')
    })
  })

  describe('When is the root path', () => {
    beforeEach(() => {
      routeName = nameToPath('/')
    })

    it('component', () => {
      expect(routeName).to.equal('/')
    })
  })

  describe('When param has a named param', () => {
    beforeEach(() => {
      routeName = nameToPath('employee/:id')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has many named params with it', () => {
    beforeEach(() => {
      routeName = nameToPath('employee/show/:id/:name')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('employee/show')
    })
  })

  describe('When param has many named params ', () => {
    beforeEach(() => {
      routeName = nameToPath('employee/:name/show/:id')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('employee')
    })
  })

  describe('When param has one value', () => {
    beforeEach(() => {
      routeName = nameToPath('projects')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('projects')
    })
  })

  describe('When param has uppercase letters', () => {
    beforeEach(() => {
      routeName = nameToPath('proJECTS')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('projects')
    })
  })

  describe('When param has named params with it', () => {
    beforeEach(() => {
      routeName = nameToPath('employee/:id')
    })

    it('should return the name', () => {
      expect(routeName).to.equal('employee')
    })
  })
})

describe('anyEmptyNestedRoute', () => {
  describe('when there are empty nested routes', () => {
    beforeEach(() => {
      emptyRoutes = anyEmptyNestedRoutes({})
    })

    it('should return true', () => {
      expect(emptyRoutes).to.be.true
    })
  })

  describe('when there are no empty nested routes', () => {
    beforeEach(() => {
      emptyRoutes = anyEmptyNestedRoutes({
        name: 'bla',
        childRoute: { name: 'foo', childRoute: { name: 'pink' } }
      })
    })

    it('should return false', () => {
      expect(emptyRoutes).to.be.false
    })
  })

  describe('when there are empty nested routes', () => {
    beforeEach(() => {
      emptyRoutes = anyEmptyNestedRoutes({ name: 'bla', childRoute: { name: 'foo', childRoute: {} } })
    })

    it('should return true', () => {
      expect(emptyRoutes).to.be.true
    })
  })
})

describe('compareRoutes', () => {
  let pathName = []
  describe('when there are no nested routes', () => {
    describe('when route is one level', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is one level', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('/admin', pathName, { name: 'admin' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })
  })

  describe('when there are nested routes', () => {
    describe('when route is one level with /', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: '/admin' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is two levels', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/teams' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin/teams')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['show', 'report'])
      })
    })

    describe('when route is many levels deep', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/teams/show/report' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin/teams/show/report')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal([])
      })
    })

    describe('when route is many levels deep but some levels unrelated', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'admin/invoices/show/report' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is many levels deep but some levels unrelated', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin/employees', pathName, { name: 'admin/invoices/show/report' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin/employees')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })

    describe('when route is many levels deep but unrelated', () => {
      beforeEach(() => {
        pathName = ['teams', 'show', 'report']
        routes = compareRoutes('admin', pathName, { name: 'other/employees/show/report' })
      })

      it('should return the base route', () => {
        expect(routes).to.equal('admin')
      })

      it('should return the route name', () => {
        expect(pathName).to.deep.equal(['teams', 'show', 'report'])
      })
    })
  })
})
