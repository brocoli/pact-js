import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import MockService from '../../src/pact-consumer-dsl/mockService'
import Interaction from '../../src/pact-consumer-dsl/interaction'

describe('MockService', () => {
  describe('#constructor', () => {
    it('creates a MockService when all mandatory parameters are in', () => {
      const mock = new MockService('consumer', 'provider', 1234)
      expect(mock).to.not.be.undefined
      expect(mock._baseURL).to.eql('http://127.0.0.1:1234')
    })

    it('creates a MockService when port is not informed', () => {
      const mock = new MockService('consumer', 'provider')
      expect(mock).to.not.be.undefined
      expect(mock._baseURL).to.eql('http://127.0.0.1:1234')
    })

    it('does not create a MockService when consumer is not informed', () => {
      expect(() => { new MockService() })
        .to.throw(Error, 'Please provide the names of the provider and consumer for this Pact.')
    })

    it('does not create a MockService when provider is not informed', () => {
      expect(() => { new MockService('consumer') })
        .to.throw(Error, 'Please provide the names of the provider and consumer for this Pact.')
    })
  })

  describe('#addInteraction', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    const interaction = new Interaction()
      .uponReceiving('duh')
      .withRequest('get', '/search')
      .willRespondWith(200)

    it('when Interaction added successfully', (done) => {
      nock(mock._baseURL).post(/interactions$/).reply(200)
      expect(mock.addInteraction(interaction)).to.eventually.notify(done)
    })

    it('when Interaction fails to be added', (done) => {
      nock(mock._baseURL).post(/interactions$/).reply(500)
      expect(mock.addInteraction(interaction)).to.eventually.be.rejectedWith(Error).notify(done)
    })
  })

  describe('#removeInteractions', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when interactions are removed successfully', (done) => {
      nock(mock._baseURL).delete(/interactions$/).reply(200)
      expect(mock.removeInteractions()).to.eventually.notify(done)
    })

    it('when interactions fail to be removed', (done) => {
      nock(mock._baseURL).delete(/interactions$/).reply(500)
      expect(mock.removeInteractions()).to.eventually.be.rejectedWith(Error).notify(done)
    })
  })

  describe('#verify', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when verification is successful', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      expect(mock.verify()).to.eventually.notify(done)
    })

    it('when verification fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(500)
      expect(mock.verify()).to.eventually.be.rejectedWith(Error).notify(done)
    })
  })

  describe('#writePact', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when writing is successful', (done) => {
      nock(mock._baseURL).post(/pact$/).reply(200)
      expect(mock.writePact()).to.eventually.notify(done)
    })

    it('when writing fails', (done) => {
      nock(mock._baseURL).post(/pact$/).reply(500)
      expect(mock.writePact()).to.eventually.be.rejectedWith(Error).notify(done)
    })
  })

  describe('#verifyAndWrite', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when verification and writing are successful', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      nock(mock._baseURL).post(/pact$/).reply(200)

      expect(mock.verifyAndWrite()).to.eventually.notify(done)
    })

    it('when verification succeeds and writing fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      nock(mock._baseURL).post(/pact$/).reply(500)
      expect(mock.verifyAndWrite()).to.eventually.be.rejectedWith(Error).notify(done)
    })

    it('when verification fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(500)
      expect(mock.verifyAndWrite()).to.eventually.be.rejectedWith(Error).notify(done)
    })
  })
})
