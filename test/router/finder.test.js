const expect = require('chai').expect
const { RouterFinder } = require('../../src/router/finder')

describe('RouterFinder', function () {
  let routes, currentUrl, routerOptions, activeRoute, notFound

  describe('When there is no custom 404 route defined', function () {
    beforeEach(function () {
      notFound = { name: '404', component: '', path: '404', redirectTo: '/404.html' }
      routes = []
      currentUrl = 'https://website.com/some/route'
      routerOptions = {}
      activeRoute = RouterFinder({ routes, currentUrl, routerOptions }).findActiveRoute()
    })

    it('should return the default 404 route', function () {
      expect(activeRoute).to.deep.equal(notFound)
    })
  })

  describe('When there is a custom 404 route defined', function () {
    beforeEach(function () {
      notFound = { name: '404', component: 'CustomNotFoundPage', path: '404', language: 'de' }
      routes = routes = [
        {
          name: '/',
          component: 'PublicLayout',
          nestedRoutes: [
            { name: 'index', component: 'PublicIndex' },
            { name: 'about-us', component: 'AboutUs' },
          ],
        },

        { name: 'login', component: 'Login' },
        { name: '404', component: 'CustomNotFoundPage' },
      ]
      currentUrl = 'https://website.com/some/route'
      routerOptions = { lang: 'de' }
      activeRoute = RouterFinder({ routes, currentUrl, routerOptions }).findActiveRoute()
    })

    it('should return the custom 404 route', function () {
      expect(activeRoute).to.deep.equal(notFound)
    })
  })
})

describe('With site prefix', function () {
  beforeEach(function () {
    routes = [
      {
        name: '/',
        component: 'PublicLayout',
        nestedRoutes: [{ name: 'index', component: 'PublicIndex' }],
      },
      { name: 'about-us', component: 'AboutUs' },
      { name: 'login', component: 'Login' },
      { name: 'project/:name', component: 'ProjectList' },
    ]

    currentUrl = 'http://web.app/company/about-us'
    routerOptions = { prefix: 'company' }
    activeRoute = RouterFinder({ routes, currentUrl, routerOptions }).findActiveRoute()
  })

  it('should set path to root path', function () {
    expect(activeRoute.path).to.equal('/company/about-us')
  })

  it('should set component name', function () {
    expect(activeRoute.component).to.equal('AboutUs')
  })
})
