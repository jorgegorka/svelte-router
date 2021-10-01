const expect = require('chai').expect
var jsdom = require('mocha-jsdom')

const SpaRouter = require('../src/spa_router').SpaRouter
const navigateTo = require('../src/spa_router').navigateTo
const localisedRoute = require('../src/spa_router').localisedRoute
const routeIsActive = require('../src/spa_router').routeIsActive

let testRouter = null
let pathName = 'http://web.app/'
let routes = []
const html = ''
const src = ''
jsdom({ html, src, url: 'http://localhost' })

function thisIsFalse() {
  return false
}

function thisIsTrue() {
  return true
}

describe('Router', function () {
  describe('When there are no routes defined and update browser history is false', function () {
    beforeEach(function () {
      testRouter = SpaRouter([], pathName).setActiveRoute(false)
    })

    it('should set the component', function () {
      expect(testRouter.component).to.be.undefined
    })

    it('should set the route name to 404', function () {
      expect(testRouter.name).to.be.undefined
    })

    it('should set the route path to 404', function () {
      expect(testRouter.path).to.be.undefined
    })

    it('should not update history', function () {
      expect(global.window.history.state).to.be.null
    })
  })

  describe('When there are no routes defined', function () {
    beforeEach(function () {
      testRouter = SpaRouter([], pathName).setActiveRoute()
    })

    it('should set the component', function () {
      expect(testRouter.component).to.be.undefined
    })

    it('should set the route name to 404', function () {
      expect(testRouter.name).to.be.undefined
    })

    it('should set the route path to 404', function () {
      expect(testRouter.path).to.be.undefined
    })

    it('should set the route path to 404', function () {
      expect(global.window.history.state.page).to.equal('/404.html')
    })
  })

  describe('When route does not exist and there is a pathname', function () {
    beforeEach(function () {
      testRouter = SpaRouter(routes, 'http://web.app/this/route/does/not/exist').setActiveRoute()
    })

    it('should set the component', function () {
      expect(testRouter.component).to.be.undefined
    })

    it('should not set the route name', function () {
      expect(testRouter.name).to.be.undefined
    })

    it('should not set the route path', function () {
      expect(testRouter.path).to.be.undefined
    })

    it('should set the browsers history to 404', function () {
      expect(global.window.history.state.page).to.equal('/404.html')
    })
  })

  describe('When route does not exist and there is a pathname', function () {
    beforeEach(function () {
      testRouter = SpaRouter(
        [{ name: '404', path: '404', component: 'CustomNotFoundPage' }],
        'http://web.app/this/route/does/not/exist'
      ).setActiveRoute()
    })

    it('should set the component', function () {
      expect(testRouter.component).to.equal('CustomNotFoundPage')
    })

    it('should set the route name to 404', function () {
      expect(testRouter.name).to.equal('404')
    })

    it('should set the route path to 404', function () {
      expect(testRouter.path).to.equal('404')
    })
  })

  describe('When there are valid routes no nesting', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [
            { name: 'index', component: 'PublicIndex' },
            { name: 'about-us', component: 'AboutUs' },
          ],
        },

        { name: 'login', component: 'Login' },
        { name: 'project/:name', component: 'ProjectList' },
      ]
    })

    describe('When root path-', function () {
      beforeEach(function () {
        pathName = 'http://web.app/'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('PublicLayout')
      })

      it('should set the child route component name', function () {
        expect(testRouter.childRoute.component).to.equal('PublicIndex')
      })
    })

    describe('When path is first level', function () {
      beforeEach(function () {
        pathName = 'https://fake.web/login'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/login')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('Login')
      })
    })
  })

  describe('Query params', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:title', component: 'ProjectList' },
        { name: '/invoice/:id', component: 'ShowInvoice' },
        {
          name: '/about-us',
          component: 'AboutUsLayout',
          nestedRoutes: [{ name: 'index', component: 'AboutUsPage' }],
        },
      ]
    })

    describe('Query params to index route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/login?q=sangria'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams.q).to.equal('sangria')
      })
    })

    describe('Query params to one level route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/login?climate=change&sea-level=rising'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams.climate).to.equal('change')
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams['sea-level']).to.equal('rising')
      })
    })

    describe('When named route does not start with a slash', function () {
      beforeEach(function () {
        pathName = 'http://web.app/project/save_earth?climate=change&sea-level=rising'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set the component name', function () {
        expect(testRouter.component).to.equal('ProjectList')
      })

      it('should update queryParams', function () {
        expect(testRouter.namedParams.title).to.equal('save_earth')
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams.climate).to.equal('change')
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams['sea-level']).to.equal('rising')
      })
    })

    describe('When named route starts with a slash', function () {
      beforeEach(function () {
        pathName = 'http://web.app/invoice/asf56dse56?fullView=true'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set the component name', function () {
        expect(testRouter.component).to.equal('ShowInvoice')
      })

      it('should update queryParams', function () {
        expect(testRouter.namedParams.id).to.equal('asf56dse56')
      })

      it('should update queryParams', function () {
        expect(testRouter.queryParams['fullView']).to.equal('true')
      })
    })
  })

  describe('When there are valid routes no nesting with named params', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:name', component: 'ProjectList' },
        {
          name: '/about-us',
          component: 'AboutUsLayout',
          nestedRoutes: [{ name: 'index', component: 'AboutUsPage' }],
        },
        {
          name: '/:customer/user-admin',
          component: 'StartsWithNamedParamIndex',
        },
      ]
    })

    describe('When route starts with a named parameter', function () {
      beforeEach(function () {
        pathName = 'http://web.app/bigcustomer/user-admin'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should find the route with the name param', function () {
        expect(testRouter.component).to.equal('StartsWithNamedParamIndex')
      })
    })

    describe(' When root path ', function () {
      beforeEach(function () {
        pathName = 'http://web.app/'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('PublicIndex')
      })
    })

    describe('When path is first level', function () {
      beforeEach(function () {
        pathName = 'http://web.app/project/easy-routing'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/project/easy-routing')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('ProjectList')
      })

      it('should set named params', function () {
        expect(testRouter.namedParams.name).to.equal('easy-routing')
      })
    })

    describe('When top level layout with index', function () {
      beforeEach(function () {
        pathName = 'http://web.app/about-us'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/about-us')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AboutUsLayout')
      })

      it('should set named params', function () {
        expect(testRouter.childRoute.component).to.equal('AboutUsPage')
      })
    })

    describe('When top level layout with index', function () {
      beforeEach(function () {
        pathName = 'http://web.app/about-us/'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/about-us')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AboutUsLayout')
      })

      it('should set named params', function () {
        expect(testRouter.childRoute.component).to.equal('AboutUsPage')
      })
    })

    describe('When top level layout with index and wrong address', function () {
      beforeEach(function () {
        pathName = 'http://web.app/about-us/pepe'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set the route path to undefined', function () {
        expect(testRouter.path).to.be.undefined
      })

      it('should set the route path to 404 here', function () {
        expect(global.window.history.state.page).to.equal('/404.html')
      })
    })
  })

  describe('When there are valid routes no nesting with more than one named params', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
        },
        { name: 'login', component: 'Login' },
        { name: 'project/:name/:date', component: 'ProjectList' },
      ]
    })

    describe('When path is first level', function () {
      beforeEach(function () {
        pathName = 'http://web.app/project/easy-routing/2019-03-26'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path to root path', function () {
        expect(testRouter.path).to.equal('/project/easy-routing/2019-03-26')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('ProjectList')
      })

      it('should set named params', function () {
        expect(testRouter.namedParams.name).to.equal('easy-routing')
      })

      it('should set named params', function () {
        expect(testRouter.namedParams.date).to.equal('2019-03-26')
      })
    })
  })

  describe('When there are namespaced routes', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [
            { name: 'index', component: 'PublicIndex' },
            { name: 'about-us', component: 'AboutUs' },
          ],
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
                  name: '/show/:id/:full-name',
                  component: 'ShowEmployee',
                },
              ],
            },
          ],
        },
      ]
    })

    describe('When path is nested with named params', function () {
      let showEmployeeRoute
      let activeRoute
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/12/Danny-filth'
        testRouter = SpaRouter(routes, pathName)
        activeRoute = testRouter.setActiveRoute()
        const employeeRoute = activeRoute.childRoute
        showEmployeeRoute = employeeRoute.childRoute
      })

      it('should set path to root path', function () {
        expect(activeRoute.path).to.equal('/admin/employees/show/12/Danny-filth')
      })

      it('should set component name', function () {
        expect(showEmployeeRoute.component).to.equal('ShowEmployee')
      })

      it('should set named params id', function () {
        expect(showEmployeeRoute.namedParams.id).to.equal('12')
      })

      it('should set named params full-name', function () {
        expect(showEmployeeRoute.namedParams['full-name']).to.equal('Danny-filth')
      })
    })
  })

  describe('When there are nested routes with index page', function () {
    beforeEach(function () {
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
                { name: 'show/:id', component: 'EmployeesShow' },
              ],
            },
          ],
        },
      ]
    })

    describe('Employee index route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path to root path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees')
      })

      it('should set root component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminLayout')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('EmployeeLayout')
      })

      it('should set nested index component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('EmployeesIndex')
      })
    })
  })

  describe('When there are nested routes', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [
            { name: 'index', component: 'PublicIndex' },
            { name: 'about-us', component: 'AboutUs' },
          ],
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
                  component: 'ShowEmployee',
                },
              ],
            },
          ],
        },
      ]
    })

    describe('Admin route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path to root path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminLayout')
      })
    })

    describe('Employees route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminLayout')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().childRoute).to.be
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.be.undefined
      })
    })

    describe('Employee show route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminLayout')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.be.undefined
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })
  })

  describe('When there are nested routes with named params', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
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
                  component: 'ShowEmployee',
                },
              ],
            },
          ],
        },
      ]
    })

    describe('Employee show route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })
  })

  describe('When there are nested routes with named params in the middle of the route', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
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
                  component: 'ShowEmployeeLayout',
                  nestedRoutes: [
                    {
                      name: 'index',
                      component: 'ShowEmployee',
                    },
                    {
                      name: 'calendar/:month',
                      component: 'CalendarEmployee',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
    })

    describe('Employee show route with named param', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/123'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set the path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show/123')
      })

      it('should set the component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set the nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set the nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('ShowEmployeeLayout')
      })

      it('should set the nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee show route with named param and extra route info', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/123/calendar'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show/123/calendar')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('ShowEmployeeLayout')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.component).to.equal('CalendarEmployee')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.namedParams).to.include({ id: '123' })
      })
    })

    describe('Employee show route with named param and extra route info', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/123/calendar/july'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show/123/calendar/july')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.component).to.equal('CalendarEmployee')
      })

      it('should set first nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.namedParams).to.include({ id: '123' })
      })

      it('should set second nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.namedParams).to.include({ month: 'july' })
      })
    })

    describe('Employee show route with named param', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set the path shadow', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show')
      })

      it('should set component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('EmployeesIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.component).to.equal('ShowEmployeeLayout')
      })

      it('should set nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.childRoute.childRoute.component).to.equal('ShowEmployee')
      })
    })
  })

  describe('When there are nested routes, named params and localisation', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
        },
        { name: 'login', component: 'Login', lang: { es: 'iniciar-sesion' } },
        { name: 'signup', component: 'SignUp', lang: { es: 'registrarse' } },
        {
          name: 'admin',
          component: 'AdminIndex',
          lang: { es: 'administrador' },
          nestedRoutes: [
            {
              name: 'employees',
              component: 'EmployeesIndex',
              lang: { es: 'empleados' },
              nestedRoutes: [
                {
                  name: 'show/:id',
                  component: 'ShowEmployeeLayout',
                  lang: { es: 'mostrar/:id', it: 'mostrare/:id' },
                  nestedRoutes: [
                    {
                      name: 'index',
                      component: 'ShowEmployee',
                    },
                    {
                      name: 'calendar/:month',
                      component: 'CalendarEmployee',
                      lang: { es: 'calendario/:month', de: 'kalender/:month' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
    })

    describe('when no language is set', function () {
      let activeRoute

      describe('a simple route', function () {
        beforeEach(function () {
          pathName = 'http://web.app/admin/employees'
          testRouter = SpaRouter(routes, pathName)
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/admin/employees')
        })

        it('should leave language empty', function () {
          expect(activeRoute.language).be.undefined
        })
      })

      describe('a simple route with default language', function () {
        beforeEach(function () {
          pathName = 'http://web.app/admin/employees'
          testRouter = SpaRouter(routes, pathName, { defaultLanguage: 'en' })
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/admin/employees')
        })

        it('should leave language empty', function () {
          expect(activeRoute.language).be.equal('en')
        })
      })

      describe('a route with named params', function () {
        beforeEach(function () {
          pathName = 'http://web.app/admin/employees/show/123/calendar/april'
          testRouter = SpaRouter(routes, pathName)
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/admin/employees/show/123/calendar/april')
        })

        it('should not set the language', function () {
          expect(activeRoute.language).to.be.undefined
        })
      })

      describe('a route with named params and a default language', function () {
        beforeEach(function () {
          pathName = 'http://web.app/admin/employees/show/123/calendar/april'
          testRouter = SpaRouter(routes, pathName, { defaultLanguage: 'en' })
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/admin/employees/show/123/calendar/april')
        })

        it('should not set the language', function () {
          expect(activeRoute.language).be.equal('en')
        })
      })

      describe('a localised route with named params', function () {
        beforeEach(function () {
          pathName = 'http://web.app/administrador/empleados/mostrar/123/calendario/abril'
          testRouter = SpaRouter(routes, pathName)
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/administrador/empleados/mostrar/123/calendario/abril')
        })

        it('should set the language', function () {
          expect(activeRoute.language).to.equal('es')
        })
      })

      describe('a partially localised route with named params', function () {
        beforeEach(function () {
          pathName = 'http://web.app/admin/employees/show/123/kalender/april'
          testRouter = SpaRouter(routes, pathName)
          activeRoute = testRouter.setActiveRoute()
        })

        it('should set the correct path', function () {
          expect(activeRoute.path).to.equal('/admin/employees/show/123/kalender/april')
        })

        it('should set the language', function () {
          expect(activeRoute.language).to.equal('de')
        })
      })
    })

    describe('when language is set', function () {
      beforeEach(function () {
        pathName = 'http://web.app/administrador/empleados'
        testRouter = SpaRouter(routes, pathName, { lang: 'es' })
      })

      it('should use the matched language route', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/administrador/empleados')
      })

      it('should set the language', function () {
        expect(testRouter.setActiveRoute().language).to.equal('es')
      })

      describe('when path does not exist in the specified language', function () {
        beforeEach(function () {
          pathName = 'http://web.app/login'
          testRouter = SpaRouter(routes, pathName, { lang: 'es' }).setActiveRoute()
        })

        it('should return 404', function () {
          expect(testRouter.path).to.be.undefined
        })

        it('should set the language', function () {
          expect(testRouter.language).to.be.undefined
        })

        describe('when route has nested routes', function () {
          beforeEach(function () {
            pathName = 'http://web.app/administrador/employees/show/123/calendar/april'
            testRouter = SpaRouter(routes, pathName, { lang: 'es' })
          })

          it('should return 404', function () {
            expect(testRouter.setActiveRoute().path).to.be.undefined
          })

          it('should set the language', function () {
            expect(testRouter.setActiveRoute().language).to.be.undefined
          })
        })

        describe('a partially localised route with named params', function () {
          beforeEach(function () {
            pathName = 'http://web.app/admin/employees/show/123/kalender/april'
            testRouter = SpaRouter(routes, pathName, { lang: 'de' }).setActiveRoute()
          })

          it('should set the correct path', function () {
            expect(testRouter.path).to.equal('/admin/employees/show/123/kalender/april')
          })

          it('should set the language', function () {
            expect(testRouter.language).to.equal('de')
          })
        })
      })

      describe('when path does exist in the specified language', function () {
        beforeEach(function () {
          pathName = 'http://web.app/iniciar-sesion'
          testRouter = SpaRouter(routes, pathName, { lang: 'es' }).setActiveRoute()
        })

        it('should return the matched path', function () {
          expect(testRouter.path).to.equal('/iniciar-sesion')
        })

        it('should set the language', function () {
          expect(testRouter.language).to.equal('es')
        })

        describe('when route has nested routes', function () {
          beforeEach(function () {
            pathName = 'http://web.app/administrador/empleados/mostrar/123/calendario/abril'
            testRouter = SpaRouter(routes, pathName, { lang: 'es' }).setActiveRoute()
          })

          it('should return y the matched path', function () {
            expect(testRouter.path).to.equal('/administrador/empleados/mostrar/123/calendario/abril')
          })

          it('should set the language', function () {
            expect(testRouter.language).to.equal('es')
          })
        })
      })
    })
  })

  describe('When there are simple routes with localisation', function () {
    let publicRoutes = []

    beforeEach(function () {
      publicRoutes = [
        { name: '/', component: 'Login', layout: 'PublicLayout' },
        { name: 'login', component: 'Login', layout: 'PublicLayout', lang: { es: 'iniciar-sesion' } },
        { name: 'logout', component: 'Logout', layout: 'PublicLayout', lang: { es: 'cerrar-sesion' } },
        { name: 'signup', component: 'Signup', layout: 'PublicLayout', lang: { es: 'registrarse' } },
        { name: 'userUpdate', component: 'UserUpdate', layout: 'PublicLayout', lang: { es: 'actualizar-usuario' } },
        {
          name: 'reset-password',
          component: 'PasswordReset',
          layout: 'PublicLayout',
          lang: { es: 'cambiar-contraseña' },
        },
        { name: 'access/:companyId', component: 'Track', layout: 'PublicLayout', lang: { es: 'acceso/:companyId' } },
      ]
    })

    describe('Login page', function () {
      beforeEach(function () {
        pathName = 'http://web.app/iniciar-sesion'
        testRouter = SpaRouter(publicRoutes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/iniciar-sesion')
      })

      it('should set the component name', function () {
        expect(testRouter.component).to.equal('Login')
      })

      it('should set the language', function () {
        expect(testRouter.language).to.equal('es')
      })
    })

    describe('Access page', function () {
      beforeEach(function () {
        pathName = 'http://web.app/acceso/4433'
        testRouter = SpaRouter(publicRoutes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/acceso/4433')
      })

      it('should set the component name', function () {
        expect(testRouter.component).to.equal('Track')
      })

      it('should set the language', function () {
        expect(testRouter.language).to.equal('es')
      })
    })
  })

  describe('When there are nested routes with no layout', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
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
            },
            {
              name: 'employees/show/:id',
              component: 'ShowEmployee',
              nestedRoutes: [{ name: 'print/3d', component: 'PrintEmployee' }],
            },
            {
              name: 'teams',
              component: 'TeamsIndex',
            },
            {
              name: 'teams/active',
              component: 'ActiveTeams',
            },
            {
              name: 'teams/show/:name',
              component: 'ShowTeams',
            },
          ],
        },
      ]
    })

    describe('Employee index route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/admin/employees')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.childRoute.component).to.equal('EmployeesIndex')
      })
    })

    describe('Employee show route without named param', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/admin/employees/show')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee show route with named param', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/robert'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set the path', function () {
        expect(testRouter.path).to.equal('/admin/employees/show/robert')
      })

      it('should set the component name', function () {
        expect(testRouter.component).to.equal('AdminIndex')
      })

      it('should set the nested component name', function () {
        expect(testRouter.childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee show route with named param and extra route info', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees/show/robert/print/3d'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set the path', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/employees/show/robert/print/3d')
      })

      it('should set the component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set the nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('ShowEmployee')
      })
    })

    describe('Employee index route with anchor hash', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees#cv'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/admin/employees')
      })

      it('should set the anchor hash', function () {
        expect(testRouter.hash).to.equal('#cv')
      })
    })

    describe('Teams index route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams'
        testRouter = SpaRouter(routes, pathName)
      })

      it('should set the route path here', function () {
        expect(testRouter.setActiveRoute().path).to.equal('/admin/teams')
      })

      it('should set the component name', function () {
        expect(testRouter.setActiveRoute().component).to.equal('AdminIndex')
      })

      it('should set the nested component name', function () {
        expect(testRouter.setActiveRoute().childRoute.component).to.equal('TeamsIndex')
      })
    })

    describe('Teams active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/active'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/admin/teams/active')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.childRoute.component).to.equal('ActiveTeams')
      })
    })

    describe('Teams show', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/show/leader-team'
        testRouter = SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should set path', function () {
        expect(testRouter.path).to.equal('/admin/teams/show/leader-team')
      })

      it('should set component name', function () {
        expect(testRouter.component).to.equal('AdminIndex')
      })

      it('should set nested component name', function () {
        expect(testRouter.childRoute.component).to.equal('ShowTeams')
      })

      it('should set the named param', function () {
        expect(testRouter.childRoute.namedParams.name).to.equal('leader-team')
      })
    })
  })
})

describe('navigateTo', function () {
  beforeEach(function () {
    pathName = 'https://fake.com/'
    routes = [
      {
        name: '/',
        component: 'PublicIndex',
      },
      {
        name: '/setup',
        component: 'SetupComponent',
        lang: { es: 'configuracion' },
      },
    ]
    SpaRouter(routes, pathName)
  })

  describe('when route is valid', function () {
    it('should set the active route to the selected route', function () {
      expect(navigateTo('/')).to.include({ name: '/', component: 'PublicIndex', path: '/' })
    })

    it('should set the active route to the localised route', function () {
      expect(navigateTo('/setup')).to.include({
        name: '/setup',
        component: 'SetupComponent',
        path: '/setup',
      })
    })
  })

  describe('when route is not valid', function () {
    it('should set the active route to 404', function () {
      expect(navigateTo('/invalid')).to.equal('/404.html')
    })
  })

  describe('when language is set', function () {
    it('should set the active route as the localised route', function () {
      expect(navigateTo('/setup', 'es')).to.include({
        name: '/configuracion',
        component: 'SetupComponent',
        path: '/configuracion',
      })
    })

    it('should set the active route as the localised route with params', function () {
      expect(navigateTo('/setup?me=true', 'es')).to.include({
        name: '/configuracion',
        component: 'SetupComponent',
        path: '/configuracion',
      })
    })
  })
})

describe('routeIsActive', function () {
  beforeEach(function () {
    routes = [
      { name: '/', component: 'MainPage' },
      {
        name: 'current',
        component: 'Current',
        nestedRoutes: [
          {
            name: 'active/:id',
            component: 'Active',
            nestedRoutes: [{ name: 'route', component: 'Route' }],
          },
        ],
      },
    ]
    pathName = 'http://web.app/current/active?test=true&routing=awesome'
  })

  describe('a standard route not active', function () {
    beforeEach(function () {
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should return false', function () {
      expect(routeIsActive('/current')).to.be.false
    })
  })

  describe('a route with a named param', function () {
    beforeEach(function () {
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should return true', function () {
      expect(routeIsActive('/current/active')).to.be.true
    })
  })

  describe('a route with a named param and a value', function () {
    beforeEach(function () {
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should return false', function () {
      expect(routeIsActive('/current/active/333')).to.be.false
    })
  })

  describe('a route with named params', function () {
    beforeEach(function () {
      pathName = 'http://web.app/current/active/4343/route/?test=true&routing=awesome'
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should return true', function () {
      expect(routeIsActive('/current/active/4343/route/')).to.be.true
    })
  })

  describe('a route with search queries', function () {
    beforeEach(function () {
      pathName = 'http://web.app/current/active/4343/route/?test=true&routing=awesome'
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should be active', function () {
      expect(routeIsActive('/current/active/4343/route/?test=true&routing=awesome')).to.be.true
    })
  })

  describe('a route with an anchor tag', function () {
    beforeEach(function () {
      pathName = 'http://web.app/current/active/4343/route/?test=true&routing=awesome#anchor'
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should be active', function () {
      expect(routeIsActive('/current/active/4343/route')).to.be.true
    })
  })

  describe('a non active route', function () {
    beforeEach(function () {
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should return false', function () {
      expect(routeIsActive('/other/not/active')).to.be.false
    })
  })

  describe('Routes in same level', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/',
          component: 'PublicIndex',
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
            },
            {
              name: 'employees/show/:id',
              component: 'ShowEmployee',
            },
            {
              name: 'teams',
              component: 'TeamsIndex',
            },
            {
              name: 'teams/active',
              component: 'ActiveTeams',
            },
            {
              name: 'teams/show/:name',
              component: 'ShowTeams',
            },
          ],
        },
      ]
    })

    describe('a standard route', function () {
      beforeEach(function () {
        pathName = 'http://web.app/login'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/login')).to.be.true
      })

      it('should return false if not matches active route', function () {
        expect(routeIsActive('/wrong')).to.be.false
      })
    })

    describe('a standard route not active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/employees'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/admin/employees')).to.be.true
      })

      it('should return false if not matches active route', function () {
        expect(routeIsActive('/admin/projects')).to.be.false
      })
    })

    describe('a standard route not active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/active'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/admin/teams/active')).to.be.true
      })

      it('should return false if not matches active route', function () {
        expect(routeIsActive('/admin/teams/projects')).to.be.false
      })
    })

    describe('a standard route not active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/show/accountants'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/admin/teams/show/accountants')).to.be.true
      })

      it('should return false if not matches active route', function () {
        expect(routeIsActive('/admin/teams/wrong/accountants')).to.be.false
      })
    })

    describe('a standard route not active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/show/accountants'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('admin/teams/show/accountants')).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('admin/teams/show/accountants/')).to.be.true
      })

      it('should return false if not matches active route', function () {
        expect(routeIsActive('/admin/teams/show/accountants/')).to.be.true
      })
    })

    describe('with include active', function () {
      beforeEach(function () {
        pathName = 'http://web.app/admin/teams/show/accountants'
        SpaRouter(routes, pathName).setActiveRoute()
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/admin', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('admin', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/teams', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('teams', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/teams/show', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('teams/show', true)).to.be.true
      })

      it('should return true if matches active route', function () {
        expect(routeIsActive('/show/accountants', true)).to.be.true
      })

      it('should return true if matches active route mix', function () {
        expect(routeIsActive('show/accountants', true)).to.be.true
      })
    })
  })
})

describe('onlyIf', function () {
  describe('when guard is true', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/admin',
          component: 'AdminLayout',
          nestedRoutes: [
            { name: 'index', component: 'AdminIndex' },
            { name: 'private', component: 'PrivateComponent' },
          ],
          onlyIf: { guard: thisIsTrue, redirect: '/login' },
        },

        { name: 'login', component: 'Login' },
      ]

      pathName = 'http://web.app/admin'
      SpaRouter(routes, pathName).setActiveRoute(true)
    })

    it('should render admin', function () {
      expect(routeIsActive('/admin')).to.be.true
    })

    it('should render login', function () {
      expect(global.window.history.state.page).to.equal('/admin')
    })
  })

  describe('when guard is false', function () {
    beforeEach(function () {
      routes = [
        {
          name: '/admin',
          component: 'AdminLayout',
          nestedRoutes: [
            { name: 'index', component: 'AdminIndex' },
            { name: 'private', component: 'PrivateComponent' },
          ],
          onlyIf: { guard: thisIsFalse, redirect: '/login' },
        },

        { name: 'login', component: 'Login' },
      ]

      pathName = 'http://web.app/admin'
      SpaRouter(routes, pathName).setActiveRoute()
    })

    it('should render login', function () {
      expect(routeIsActive('/login')).to.be.true
    })

    it('should render login', function () {
      expect(global.window.history.state.page).to.equal('/login')
    })
  })
})

describe('localisedRoute', function () {
  beforeEach(function () {
    routes = [
      {
        name: '/admin',
        component: 'AdminLayout',
        lang: { es: 'administrador' },
        nestedRoutes: [
          { name: 'index', component: 'AdminIndex' },
          { name: 'private', component: 'PrivateComponent', lang: { es: 'privado' } },
        ],
        onlyIf: { guard: thisIsTrue, redirect: '/login' },
      },

      { name: 'login', component: 'Login' },
    ]

    pathName = 'http://web.app/admin'
    SpaRouter(routes, pathName)
  })

  it('should render admin', function () {
    expect(localisedRoute('/admin', 'es').path).to.equal('/administrador')
  })

  it('should render admin private', function () {
    expect(localisedRoute('/admin/private', 'es').path).to.equal('/administrador/privado')
  })
})

describe('admin routes example localised', function () {
  beforeEach(function () {
    routes = [
      {
        name: 'public/users/show/:user',
        component: 'PublicLogin',
        lang: { es: 'publico/usuarios/mostrar/:user' },
      },
      {
        name: 'admin',
        component: 'AdminLayout',
        nestedRoutes: [
          { name: 'index', component: 'DashboardIndex' },
          {
            name: 'company',
            component: 'CompanyLayout',
            lang: { es: 'empresa' },
            nestedRoutes: [
              { name: 'index', component: 'CompanyIndex' },
              { name: 'edit', component: 'CompanyEdit' },
            ],
          },
          {
            name: 'employees',
            component: 'EmployeesLayout',
            lang: { es: 'empleados' },
            nestedRoutes: [
              { name: 'index', component: 'EmployeesIndex' },
              { name: 'new', component: 'EmployeesNew', lang: { es: 'nuevo' } },
              { name: 'show/:id', component: 'EmployeesShow', lang: { es: 'mostrar/:id' } },
              { name: 'edit/:id', component: 'EmployeesEdit', lang: { es: 'modificar/:id' } },
              { name: 'calendar/:id', component: 'EmployeeCalendar', lang: { es: 'calendario/:id' } },
              { name: 'list/:id', component: 'EmployeeActivityList', lang: { es: 'listado/:id' } },
            ],
          },
          {
            name: 'calendar/:teamId',
            component: 'CalendarIndex',
            lang: { es: 'calendario/:teamId' },
          },
          {
            name: 'schedules',
            component: 'SchedulesLayout',
            lang: { es: 'agenda' },
            nestedRoutes: [
              { name: 'index', component: 'SchedulesIndex' },
              { name: 'new', component: 'SchedulesNew', lang: { es: 'nuevo' } },
              {
                name: 'show/:id',
                layout: 'SchedulesShowLayout',
                lang: { es: 'mostrar/:id' },
                nestedRoutes: [
                  { name: 'index', component: 'SchedulesShow' },
                  { name: 'hours/new/:day', component: 'SchedulesHoursNew', lang: { es: 'horas/nuevo/:day' } },
                ],
              },
              { name: 'edit/:id', component: 'SchedulesEdit', lang: { es: 'modificar/:id' } },
            ],
          },
          {
            name: 'teams',
            component: 'TeamsIndex',
            lang: { es: 'equipos' },
            layout: 'TeamsLayout',
          },
          { name: 'teams/show/:id', component: 'TeamsShow', lang: { es: 'equipos/mostrar/:id' } },
          {
            name: 'activities',
            component: 'ActivitiesLayout',
            lang: { es: 'actividades' },
            nestedRoutes: [
              { name: 'index', component: 'ActivitiesIndex' },
              { name: 'new', component: 'ActivitiesNew', lang: { es: 'nueva' } },
              { name: 'edit/:id', component: 'ActivitiesEdit', lang: { es: 'modificar/:id' } },
            ],
          },
          {
            name: 'reports',
            component: 'ReportsLayout',
            lang: { es: 'informes' },
            nestedRoutes: [
              { name: 'daily-absence', component: 'DailyAbsent', lang: { es: 'ausencias-diario' } },
              { name: 'pending', component: 'PendingActivities', lang: { es: 'pendientes' } },
              { name: 'activity-list', component: 'ActivityList', lang: { es: 'listado' } },
              { name: 'late-checkout', component: 'LateCheckoutActivities', lang: { es: 'entrada-tarde' } },
            ],
          },
        ],
      },
    ]

    pathName = 'http://web.app/admin'
    SpaRouter(routes, pathName, { defaultLanguage: 'en' })
  })

  it('should render admin route', function () {
    expect(localisedRoute('/admin', 'es').path).to.equal('/admin')
  })

  it('should render admin calendar route', function () {
    expect(localisedRoute('/admin/calendar', 'es').path).to.equal('/admin/calendario')
  })

  it('should render admin calendar route', function () {
    expect(localisedRoute('/admin/calendar/june', 'es').path).to.equal('/admin/calendario/june')
  })

  it('should render admin employees route', function () {
    expect(localisedRoute('/admin/employees', 'es').path).to.equal('/admin/empleados')
  })

  it('should render admin employees route', function () {
    expect(localisedRoute('/admin/employees/edit/888', 'es').path).to.equal('/admin/empleados/modificar/888')
  })

  it('should render admin schedules route', function () {
    expect(localisedRoute('/admin/schedules/show/123/hours/new/monday', 'es').path).to.equal(
      '/admin/agenda/mostrar/123/horas/nuevo/monday'
    )
  })

  it('should render admin schedules route', function () {
    expect(localisedRoute('/admin/schedules/show/123/hours/new', 'es').path).to.equal(
      '/admin/agenda/mostrar/123/horas/nuevo'
    )
  })

  it('should render public route', function () {
    expect(localisedRoute('public/users/show/frank', 'es').path).to.equal('/publico/usuarios/mostrar/frank')
  })
})

describe('With site prefix', function () {
  const routes = [
    {
      name: '/',
      component: 'PublicLayout',
      nestedRoutes: [{ name: 'index', component: 'PublicIndex' }],
    },
    { name: 'about-us', component: 'AboutUs' },
    { name: 'login', component: 'Login' },
    { name: 'project/:name', component: 'ProjectList' },
    {
      name: 'admin',
      component: 'AdminLayout',
      nestedRoutes: [
        { name: 'index', component: 'DashboardIndex' },
        {
          name: 'company',
          component: 'CompanyLayout',
          lang: { es: 'empresa' },
          nestedRoutes: [
            { name: 'index', component: 'CompanyIndex' },
            { name: 'edit', component: 'CompanyEdit' },
          ],
        },
        {
          name: 'employees',
          component: 'EmployeesLayout',
          lang: { es: 'empleados' },
          nestedRoutes: [
            { name: 'index', component: 'EmployeesIndex' },
            { name: 'new', component: 'EmployeesNew', lang: { es: 'nuevo' } },
            { name: 'show/:id', component: 'EmployeesShow', lang: { es: 'mostrar/:id' } },
            { name: 'edit/:id', component: 'EmployeesEdit', lang: { es: 'modificar/:id' } },
            { name: 'calendar/:id', component: 'EmployeeCalendar', lang: { es: 'calendario/:id' } },
            { name: 'list/:id', component: 'EmployeeActivityList', lang: { es: 'listado/:id' } },
          ],
        },
      ],
    },
  ]

  describe('root route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/company/'
      activeRoute = SpaRouter(routes, currentUrl, { prefix: 'company' }).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/company/')
    })

    it('should set component name', function () {
      expect(activeRoute.component).to.equal('PublicLayout')
    })
  })

  describe('about us route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/company/about-us'
      activeRoute = SpaRouter(routes, currentUrl, { prefix: 'company' }).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/company/about-us')
    })

    it('should set component name', function () {
      expect(activeRoute.component).to.equal('AboutUs')
    })
  })

  describe('named params', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/company/project/miracle'
      activeRoute = SpaRouter(routes, currentUrl, { prefix: 'company' }).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/company/project/miracle')
    })

    it('should set component name', function () {
      expect(activeRoute.component).to.equal('ProjectList')
    })
  })

  describe('named params', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/admin/employees/show/12/Danny-filth'
      activeRoute = SpaRouter(routes, currentUrl, { prefix: 'company' }).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/company/admin/employees/show/12')
    })

    it('should set component name', function () {
      expect(activeRoute.component).to.equal('AdminLayout')
    })

    it('should set named params', function () {
      expect(activeRoute.childRoute.childRoute.namedParams.id).to.equal('12')
    })
  })
})

describe('With site prefix', function () {
  const routes = [
    {
      name: '/',
      component: 'StartView',
    },
    {
      name: '/login',
      layout: 'StartView',
      component: 'Login',
    },
    {
      name: '/main',
      layout: 'MainLayout',
      onlyIf: {
        guard: () => true,
        redirect: '/login',
      },
      nestedRoutes: [
        {
          name: 'dashboard',
          component: 'Dashboard',
        },
        {
          name: 'profile',
          layout: 'RouterComponent',
          component: 'UserProfile',
          nestedRoutes: [
            {
              name: 'view',
              component: 'UserProfile',
            },
            {
              name: 'edit',
              component: 'UserProfileEdit',
            },
          ],
        },
      ],
    },
    {
      name: '404',
      path: '404',
      component: 'View404',
    },
  ]

  describe('main dashboard route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/main/dashboard'
      activeRoute = SpaRouter(routes, currentUrl).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/main/dashboard')
    })

    it('should set the layout name', function () {
      expect(activeRoute.layout).to.equal('MainLayout')
    })

    it('should set component name', function () {
      expect(activeRoute.childRoute.component).to.equal('Dashboard')
    })
  })

  describe('profile route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/main/profile'
      activeRoute = SpaRouter(routes, currentUrl).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/main/profile')
    })

    it('should set the layout name', function () {
      expect(activeRoute.layout).to.equal('MainLayout')
    })

    it('should set layout name', function () {
      expect(activeRoute.childRoute.layout).to.equal('RouterComponent')
    })

    it('should set component name', function () {
      expect(activeRoute.childRoute.component).to.equal('UserProfile')
    })
  })

  describe('profile view route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/main/profile/view'
      activeRoute = SpaRouter(routes, currentUrl).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/main/profile/view')
    })

    it('should set the layout name', function () {
      expect(activeRoute.layout).to.equal('MainLayout')
    })

    it('should set layout name', function () {
      expect(activeRoute.childRoute.layout).to.equal('RouterComponent')
    })

    it('should set component name', function () {
      expect(activeRoute.childRoute.childRoute.component).to.equal('UserProfile')
    })
  })

  describe('profile edit route', function () {
    beforeEach(function () {
      currentUrl = 'http://web.app/main/profile/edit'
      activeRoute = SpaRouter(routes, currentUrl).setActiveRoute()
    })

    it('should set path to root path', function () {
      expect(activeRoute.path).to.equal('/main/profile/edit')
    })

    it('should set the layout name', function () {
      expect(activeRoute.layout).to.equal('MainLayout')
    })

    it('should set the child layout name', function () {
      expect(activeRoute.childRoute.layout).to.equal('RouterComponent')
    })

    it('should set component name', function () {
      expect(activeRoute.childRoute.childRoute.component).to.equal('UserProfileEdit')
    })
  })
})
