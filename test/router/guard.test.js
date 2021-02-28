const expect = require('chai').expect

const { RouterGuard } = require('../../src/router/guard')

function thisIsFalse() {
  return false
}

function thisIsTrue() {
  return true
}

function thisIsAPromise() {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve(true)
    }, 200)
  })
}

describe('RouterGuard', function () {
  let guard

  describe('when guard function returns true', function () {
    beforeEach(function () {
      guard = RouterGuard({ guard: thisIsTrue, redirect: '/login' })
    })

    it('should not redirect', function () {
      expect(guard.redirect()).to.be.false
    })
  })

  describe('when guard function returns false', function () {
    beforeEach(function () {
      guard = RouterGuard({ guard: thisIsFalse, redirect: '/login' })
    })

    it('should redirect', function () {
      expect(guard.redirect()).to.be.true
    })
  })

  describe('redirectPath', function () {
    it('should return the redirect path', function () {
      guard = RouterGuard({ redirect: '/login' })

      expect(guard.redirectPath()).to.equal('/login')
    })
  })
})
