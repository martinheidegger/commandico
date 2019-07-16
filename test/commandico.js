'use strict'

var commandico = require('..')
var expect = require('chai').expect
var path = require('path')

describe('standard execution', () => {
  it('simplest execution', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu'])
  )

  it('fallback execution', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute([])
  )

  it('fallback on missing array', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute()
  )

  it('fallback on null', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute([null])
  )

  it('fallback on something', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute(['something'])
  )

  it('non default entries', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler () {}
      }, {
        aliases: ['moxy'],
        handler: done
      }])
      .execute(['moxy'])
  )

  it('non default entries', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler () {}
      }, {
        aliases: ['moxy'],
        handler: done
      }])
      .execute(['moxy'])
  )

  it('modifier execution', done => {
    let v = false
    commandico(null, 'menu')
      .addModifiers([{
        aliases: ['v'],
        handler () {
          v = true
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler () {
          expect(v).to.equal(true)
          done()
        }
      }])
      .execute(['menu', '-v'])
  })

  it('missing modifiers', done =>
    commandico(null, 'menu')
      .addModifiers([{
        aliases: ['x'],
        handler () {
          throw new Error('?')
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu', '-v'])
  )

  it('missing default', done => {
    try {
      commandico(null, 'menu')
        .execute(['menu', '-v'])
    } catch (e) {
      done()
      return
    }
    throw new Error('No error thrown even though default was missing.')
  })

  it('modifier filter=true execution', done => {
    let v = false
    commandico(null, 'menu')
      .addModifiers([{
        aliases: ['v'],
        filter: () => false,
        handler () {
          v = true
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler () {
          expect(v).to.equal(false)
          done()
        }
      }])
      .execute(['menu', '-v'])
  })

  it('modifier filter=false execution', done => {
    let v = false
    commandico(null, 'menu')
      .addModifiers([{
        aliases: ['v'],
        filter: () => true,
        handler () {
          v = true
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler () {
          expect(v).to.equal(true)
          done()
        }
      }])
      .execute(['menu', '-v'])
  })

  it('multiple modifiers', done => {
    let v = 0
    commandico(null, 'menu')
      .addModifiers([{
        aliases: ['v'],
        handler () {
          v += 1
        }
      }, {
        aliases: ['v'],
        handler () {
          v += 1
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler () {
          expect(v).to.equal(2)
          done()
        }
      }])
      .execute(['menu', '-v'])
  })

  it('menu filter', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }, {
        aliases: ['menu'],
        filter: () => false,
        handler () {
          throw new Error('?')
        }
      }])
      .execute(['menu'])
  )

  it('menu filter order test', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        filter: () => false,
        handler () {
          throw new Error('?')
        }
      }, {
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu'])
  )

  it('command order test', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler () {
          throw new Error('?')
        }
      }, {
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu'])
  )

  it('multi command order test', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler () {
          throw new Error('?')
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu'])
  )

  it('loadCommands test', done => {
    const command = commandico(null, 'menu')
      .loadCommands(path.normalize(`${__dirname}/../test_cmds`))
      .getCommand('menu')

    expect(command).to.not.equal(null)
    done()
  })

  it('ordinary modifier executuoin', done => {
    const scope = {}
    let called = 0
    commandico(scope, 'menu')
      .addModifiers([{
        aliases: ['v', 'version'],
        handler (modifierScope, value, alias) {
          expect(modifierScope).to.be.equal(scope)
          expect(value).to.be.equal(2)
          expect(alias).to.be.equal('version')
          called++
        }
      }])
      .addCommands([{
        aliases: ['menu'],
        handler () {
          expect(called).to.be.equal(1)
          done()
        }
      }])
      .execute(['menu', '--version=2'])
  })

  it('loadModifiers test', done => {
    const modifiers = commandico(null, 'menu')
      .loadModifiers(path.normalize(`${__dirname}/../test_modifier`))
      .modifiers

    expect(modifiers[0]).to.not.equal(null)
    done()
  })

  it('ordered multi command order test', done =>
    commandico(null, 'menu')
      .addCommands([{
        order: 1,
        aliases: ['menu'],
        handler: done
      }, {
        aliases: ['menu'],
        handler () {
          throw new Error('?')
        }
      }])
      .execute(['menu'])
  )

  it('add various orders', done =>
    commandico(null, 'menu')
      .addCommands([{
        order: 2,
        aliases: ['menu'],
        handler: done
      }, {
        order: 1,
        aliases: ['menu'],
        handler () {
          throw new Error('?')
        }
      }])
      .execute(['menu'])
  )

  it('add various orders', done =>
    commandico(null, 'menu')
      .addCommands([{
        aliases: ['menu'],
        handler () {
          throw new Error('?')
        }
      }, {
        order: 1,
        aliases: ['menu'],
        handler: done
      }])
      .execute(['menu'])
  )
})
