import { expect } from 'chai'

import { RouterGuard } from '../../src/router/guard.js'

function thisIsFalse() {
  return false
}

function thisIsTrue() {
  return true
}

describe('RouterGuard', function() {
  let guard

  describe('when guard function returns true', function() {
    beforeEach(function() {
      guard = RouterGuard({ guard: thisIsTrue, redirect: '/login' })
    })

    it('should not redirect', function() {
      expect(guard.redirect()).to.be.false
    })
  })

  describe('when guard function returns false', function() {
    beforeEach(function() {
      guard = RouterGuard({ guard: thisIsFalse, redirect: '/login' })
    })

    it('should redirect', function() {
      expect(guard.redirect()).to.be.true
    })
  })

  describe('redirectPath', function() {
    it('should return the redirect path', function() {
      guard = RouterGuard({ redirect: '/login' })

      expect(guard.redirectPath()).to.equal('/login')
    })
  })
})
