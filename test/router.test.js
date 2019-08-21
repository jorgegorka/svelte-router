const expect = require('chai').expect
const SpaRouter = require('../src/router').SpaRouter
const navigateTo = require('../src/router').navigateTo
const routeIsActive = require('../src/router').routeIsActive

let testRouter = null
let pathName = 'http://web.app/'
let routes = []

describe('Router', function() {
  xdescribe('When route does not exist', function() {
    beforeEach(function() {
      testRouter = SpaRouter({ routes: [], pathName })
    })

    it('should set the component', function() {
      expect(testRouter.activeRoute.component).to.equal('')
    })

    it('should set the route name to 404', function() {
      expect(testRouter.activeRoute.name).to.equal('404')
    })

    it('should set the route path to 404', function() {
      expect(testRouter.activeRoute.path).to.equal('404')
    })
  })

  xdescribe('When route does not exist and there is a pathname', function() {
    beforeEach(function() {
      testRouter = SpaRouter({
        routes,
        pathName: 'http://web.app/this/route/does/not/exist'
      })
    })

    it('should set thecomponent', function() {
      expect(testRouter.activeRoute.component).to.equal('')
    })

    it('should set the route name to 404', function() {
      expect(testRouter.activeRoute.name).to.equal('404')
    })

    it('should set the route path to 404', function() {
      expect(testRouter.activeRoute.path).to.equal('404')
    })
  })

  xdescribe('When there are valid routes no nesting', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [{ name: 'index', component: 'PublicIndex' }, { name: 'about-us', component: 'AboutUs' }]
        },

        { name: 'login', component: 'Login' },
        { name: 'project/:name', component: 'ProjectList' }
      ]
    })

    xdescribe('When root path', function() {
      beforeEach(function() {
        pathName = 'http://web.app/'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('PublicLayout')
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('PublicIndex')
      })
    })

    xdescribe('When path is first level', function() {
      beforeEach(function() {
        pathName = 'https://fake.web/login'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/login')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('Login')
      })
    })
  })

  xdescribe('Query params', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicIndex'
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:title', component: 'ProjectList' },
        {
          name: '/about-us',
          component: 'AboutUsLayout',
          nestedRoutes: [{ name: 'index', component: 'AboutUsPage' }]
        }
      ]
    })

    xdescribe('Query params to index route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/login?q=sangria'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should update queryParams', function() {
        expect(testRouter.activeRoute.queryParams.q).to.equal('sangria')
      })
    })

    xdescribe('Query params to one level route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/login?climate=change&sea-level=rising'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should update queryParams', function() {
        expect(testRouter.activeRoute.queryParams.climate).to.equal('change')
      })

      it('should update queryParams', function() {
        expect(testRouter.activeRoute.queryParams['sea-level']).to.equal('rising')
      })
    })
  })

  xdescribe('Query params to named routes', function() {
    beforeEach(function() {
      pathName = 'http://web.app/project/save_earth?climate=change&sea-level=rising'
      testRouter = SpaRouter({ routes, pathName })
    })

    it('should update queryParams', function() {
      expect(testRouter.activeRoute.namedParams.title).to.equal('save_earth')
    })

    it('should update queryParams', function() {
      expect(testRouter.activeRoute.queryParams.climate).to.equal('change')
    })

    it('should update queryParams', function() {
      expect(testRouter.activeRoute.queryParams['sea-level']).to.equal('rising')
    })
  })

  xdescribe('When there are valid routes no nesting with named params', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicIndex'
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:name', component: 'ProjectList' },
        {
          name: '/about-us',
          component: 'AboutUsLayout',
          nestedRoutes: [{ name: 'index', component: 'AboutUsPage' }]
        }
      ]
    })

    xdescribe('When path is first level', function() {
      beforeEach(function() {
        pathName = 'http://web.app/project/easy-routing'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/project/easy-routing')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('ProjectList')
      })

      it('should set named params', function() {
        expect(testRouter.activeRoute.namedParams.name).to.equal('easy-routing')
      })
    })

    xdescribe('When top level layout with index', function() {
      beforeEach(function() {
        pathName = 'http://web.app/about-us'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/about-us')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AboutUsLayout')
      })

      it('should set named params', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('AboutUsPage')
      })
    })

    xdescribe('When top level layout with index', function() {
      beforeEach(function() {
        pathName = 'http://web.app/about-us/'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/about-us')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AboutUsLayout')
      })

      it('should set named params', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('AboutUsPage')
      })
    })

    xdescribe('When top level layout with index and wrong address', function() {
      beforeEach(function() {
        pathName = 'http://web.app/about-us/pepe'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set the route name to 404', function() {
        expect(testRouter.activeRoute.name).to.equal('404')
      })

      it('should set the route path to 404', function() {
        expect(testRouter.activeRoute.path).to.equal('404')
      })
    })
  })

  xdescribe('When there are valid routes no nesting with more than one named params', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicIndex'
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:name/:date', component: 'ProjectList' }
      ]
    })

    xdescribe('When path is first level', function() {
      beforeEach(function() {
        pathName = 'http://web.app/project/easy-routing/2019-03-26'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/project/easy-routing/2019-03-26')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('ProjectList')
      })

      it('should set named params', function() {
        expect(testRouter.activeRoute.namedParams.name).to.equal('easy-routing')
      })

      it('should set named params', function() {
        expect(testRouter.activeRoute.namedParams.date).to.equal('2019-03-26')
      })
    })
  })

  xdescribe('When there are namespaced routes', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [{ name: 'index', component: 'PublicIndex' }, { name: 'about-us', component: 'AboutUs' }]
        },

        { name: 'login', component: 'Login' },
        {
          name: 'admin',
          component: 'AdminLayout',
          nestedRoutes: [
            { name: 'index', component: 'AdminIndex' },
            {
              name: 'employees',
              nestedRoutes: [
                { name: 'index', component: 'EmployeesIndex' },
                {
                  name: 'show/:id/:full-name',
                  component: 'ShowEmployee'
                }
              ]
            }
          ]
        }
      ]
    })
    xdescribe('When path is nested with named params', function() {
      let showEmployeeRoute
      let activeRoute
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show/12/Danny-filth'
        testRouter = SpaRouter({ routes, pathName })
        activeRoute = testRouter.activeRoute
        const employeeRoute = activeRoute.childRoute
        showEmployeeRoute = employeeRoute.childRoute
      })

      it('should set path to root path', function() {
        expect(activeRoute.path).to.equal('/admin/employees/show/12/Danny-filth')
      })

      it('should set component name', function() {
        expect(showEmployeeRoute.component).to.equal('ShowEmployee')
      })

      it('should set named params', function() {
        expect(showEmployeeRoute.namedParams.id).to.equal('12')
      })

      it('should set named params', function() {
        expect(showEmployeeRoute.namedParams['full-name']).to.equal('Danny-filth')
      })
    })
  })

  xdescribe('When there are nested routes with index page', function() {
    beforeEach(function() {
      routes = [
        {
          name: 'admin',
          component: 'AdminLayout',
          nestedRoutes: [
            { name: 'index', component: 'DashboardIndex' },
            {
              name: 'employees',
              component: 'EmployeeLayout',
              nestedRoutes: [
                { name: 'index', component: 'EmployeesIndex' },
                { name: 'show/:id', component: 'EmployeesShow' }
              ]
            }
          ]
        }
      ]
    })

    xdescribe('Employee index route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees')
      })

      it('should set root component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminLayout')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('EmployeeLayout')
      })

      it('should set nested index component name', function() {
        expect(testRouter.activeRoute.childRoute.childRoute.component).to.equal('EmployeesIndex')
      })
    })
  })

  xdescribe('When there are nested routes', function() {
    beforeEach(function() {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [{ name: 'index', component: 'PublicIndex' }, { name: 'about-us', component: 'AboutUs' }]
        },

        { name: 'login', component: 'Login' },
        {
          name: 'admin',
          component: 'AdminLayout',
          nestedRoutes: [
            { name: 'index', component: 'AdminIndex' },
            {
              name: 'employees',
              nestedRoutes: [
                { name: 'index', component: 'EmployeesIndex' },
                {
                  name: 'show/:id/:full-name',
                  component: 'ShowEmployee'
                }
              ]
            }
          ]
        }
      ]
    })

    xdescribe('Admin route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path to root path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminLayout')
      })
    })

    xdescribe('Employees route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminLayout')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.childRoute).to.be
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.be.undefined
      })
    })

    xdescribe('Employee show route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees/show')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminLayout')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.be.undefined
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })
  })

  xdescribe('When there are nested routes with named params', function() {
    beforeEach(function() {
      routes = [
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
              component: 'EmployeesIndex',
              nestedRoutes: [
                {
                  name: 'show/:id',
                  component: 'ShowEmployee'
                }
              ]
            }
          ]
        }
      ]
    })

    xdescribe('Employee show route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees/show')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })
  })

  describe('When there are nested routes with no layout', function() {
    beforeEach(function() {
      routes = [
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
    })

    xdescribe('Employee index route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('EmployeesIndex')
      })
    })

    describe('Employee show route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees/show')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee list route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show/batman/'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees/show/batman')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee list route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees/show/batman/list'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/employees/show/batman/list')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('ListEmployee')
      })
    })

    xdescribe('Teams index route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/teams')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('TeamsIndex')
      })
    })

    xdescribe('Teams active', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams/active'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/teams/active')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('ActiveTeams')
      })
    })

    xdescribe('Teams show', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams/show/leader-team'
        testRouter = SpaRouter({ routes, pathName })
      })

      it('should set path', function() {
        expect(testRouter.activeRoute.path).to.equal('/admin/teams/show/leader-team')
      })

      it('should set component name', function() {
        expect(testRouter.activeRoute.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function() {
        expect(testRouter.activeRoute.childRoute.component).to.equal('ShowTeams')
      })

      it('should set the named param', function() {
        expect(testRouter.activeRoute.childRoute.namedParams.name).to.equal('leader-team')
      })
    })
  })
})

xdescribe('navigateTo', function() {
  beforeEach(function() {
    pathName = 'https://fake.com/'
    SpaRouter({ routes: [{ name: '/', component: 'MainPage' }], pathName }).activeRoute
  })

  xdescribe('when route is valid', function() {
    it('should set the active route to selected route', function() {
      expect(navigateTo('/')).to.include({ name: '/', component: 'MainPage', path: '/' })
    })
  })

  xdescribe('when route is not valid', function() {
    it('should set the active route to 404', function() {
      expect(navigateTo('/invalid')).to.include({ name: '404', component: '', path: '404' })
    })
  })
})

xdescribe('routeIsActive', function() {
  beforeEach(function() {
    routes = [
      { name: '/', component: 'MainPage' },
      {
        name: 'current',
        component: 'Current',
        nestedRoutes: [
          {
            name: 'active/:id',
            component: 'Active',
            nestedRoutes: [{ name: 'route', component: 'Route' }]
          }
        ]
      }
    ]
    pathName = 'http://web.app/current/active?test=true&routing=awesome'
  })

  xdescribe('a standard route not active', function() {
    beforeEach(function() {
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return false', function() {
      expect(routeIsActive('/current')).to.be.false
    })
  })

  xdescribe('a route with a named param', function() {
    beforeEach(function() {
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return true', function() {
      expect(routeIsActive('/current/active')).to.be.true
    })
  })

  xdescribe('a route with a named param and a value', function() {
    beforeEach(function() {
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return false', function() {
      expect(routeIsActive('/current/active/333')).to.be.false
    })
  })

  xdescribe('a route with named params', function() {
    beforeEach(function() {
      pathName = 'http://web.app/current/active/4343/route/?test=true&routing=awesome'
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return true', function() {
      expect(routeIsActive('/current/active/4343/route/')).to.be.true
    })
  })

  xdescribe('a route with search queries', function() {
    beforeEach(function() {
      pathName = 'http://web.app/current/active/4343/route/?test=true&routing=awesome'
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return true', function() {
      expect(routeIsActive('/current/active/4343/route/?test=true&routing=awesome')).to.be.true
    })
  })

  xdescribe('a non active route', function() {
    beforeEach(function() {
      SpaRouter({ routes, pathName }).activeRoute
    })

    it('should return false', function() {
      expect(routeIsActive('/other/not/active')).to.be.false
    })
  })

  xdescribe('Routes in same level', function() {
    beforeEach(function() {
      routes = [
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
    })

    xdescribe('a standard route', function() {
      beforeEach(function() {
        pathName = 'http://web.app/login'
        SpaRouter({ routes, pathName }).activeRoute
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('/login')).to.be.true
      })

      it('should return false if not matches active route', function() {
        expect(routeIsActive('/wrong')).to.be.false
      })
    })

    xdescribe('a standard route not active', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/employees'
        SpaRouter({ routes, pathName }).activeRoute
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('/admin/employees')).to.be.true
      })

      it('should return false if not matches active route', function() {
        expect(routeIsActive('/admin/projects')).to.be.false
      })
    })

    xdescribe('a standard route not active', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams/active'
        SpaRouter({ routes, pathName }).activeRoute
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('/admin/teams/active')).to.be.true
      })

      it('should return false if not matches active route', function() {
        expect(routeIsActive('/admin/teams/projects')).to.be.false
      })
    })

    xdescribe('a standard route not active', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams/show/accountants'
        SpaRouter({ routes, pathName }).activeRoute
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('/admin/teams/show/accountants')).to.be.true
      })

      it('should return false if not matches active route', function() {
        expect(routeIsActive('/admin/teams/wrong/accountants')).to.be.false
      })
    })

    xdescribe('a standard route not active', function() {
      beforeEach(function() {
        pathName = 'http://web.app/admin/teams/show/accountants'
        SpaRouter({ routes, pathName }).activeRoute
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('admin/teams/show/accountants')).to.be.true
      })

      it('should return true if matches active route', function() {
        expect(routeIsActive('admin/teams/show/accountants/')).to.be.true
      })

      it('should return false if not matches active route', function() {
        expect(routeIsActive('/admin/teams/show/accountants/')).to.be.true
      })
    })
  })
})
