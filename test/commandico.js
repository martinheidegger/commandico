'use strict';

var commandico = require('../commandico');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var test = lab.test;

test('simplest execution', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute(['menu']);
});

test('fallback execution', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute([]);
});

test('fallback on missing array', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute();
});

test('fallback on null', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute([null]);
});

test('fallback on something', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute(['something']);
});

test('non default entries', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        return;
      }
    }, {
      aliases: ['moxy'],
      handler: done
    }])
    .execute(['moxy']);
});

test('non default entries', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        return;
      }
    }, {
      aliases: ['moxy'],
      handler: done
    }])
    .execute(['moxy']);
});

test('modifier execution', function (done) {
  var v = false;
  commandico(null, 'menu')
    .addModifiers([{
      aliases: ['v'],
      handler: function () {
        v = true;
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        Code.expect(v).to.equal(true);
        done();
      }
    }])
    .execute(['menu', '-v']);
});

test('missing modifiers', function (done) {
  commandico(null, 'menu')
    .addModifiers([{
      aliases: ['x'],
      handler: function () {
        throw new Error('?');
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute(['menu', '-v']);
});

test('missing default', function (done) {
  try {
    commandico(null, 'menu')
      .execute(['menu', '-v']);
  } catch(e) {
    done();
    return;
  }
  throw new Error('No error thrown even though default was missing.');
});

test('modifier filter=true execution', function (done) {
  var v = false;
  commandico(null, 'menu')
    .addModifiers([{
      aliases: ['v'],
      filter: function () {
        return false;
      },
      handler: function () {
        v = true;
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        Code.expect(v).to.equal(false);
        done();
      }
    }])
    .execute(['menu', '-v']);
});

test('modifier filter=false execution', function (done) {
  var v = false;
  commandico(null, 'menu')
    .addModifiers([{
      aliases: ['v'],
      filter: function () {
        return true;
      },
      handler: function () {
        v = true;
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        Code.expect(v).to.equal(true);
        done();
      }
    }])
    .execute(['menu', '-v']);
});

test('multiple modifiers', function (done) {
  var v = 0;
  commandico(null, 'menu')
    .addModifiers([{
      aliases: ['v'],
      handler: function () {
        v += 1;
      }
    }, {
      aliases: ['v'],
      handler: function () {
        v += 1;
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        Code.expect(v).to.equal(2);
        done();
      }
    }])
    .execute(['menu', '-v']);
});

test('menu filter', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }, {
      aliases: ['menu'],
      filter: function () {
        return false;
      },
      handler: function () {
        throw new Error('?');
      }
    }])
    .execute(['menu']);
});

test('menu filter order test', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      filter: function () {
        return false;
      },
      handler: function () {
        throw new Error('?');
      }
    }, {
      aliases: ['menu'],
      handler: done
    }])
    .execute(['menu']);
});

test('command order test', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        throw new Error('?');
      }
    }, {
      aliases: ['menu'],
      handler: done
    }])
    .execute(['menu']);
});

test('multi command order test', function (done) {
  commandico(null, 'menu')
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        throw new Error('?');
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: done
    }])
    .execute(['menu']);
});

test('loadCommands test', function (done) {
  var command = commandico(null, 'menu')
    .loadCommands(__dirname + '/../test_cmds')
    .getCommand('menu');

  Code.expect(command).to.not.equal(null);
  done();
});

test('ordinary modifier executuoin', function (done) {
  var scope = {};
  var called = 0;
  commandico(scope, 'menu')
    .addModifiers([{
      aliases: ['v', 'version'],
      handler: function (modifierScope, value, alias) {
        Code.expect(modifierScope).to.be.equal(scope);
        Code.expect(value).to.be.equal(2);
        Code.expect(alias).to.be.equal('version');
        called++;
      }
    }])
    .addCommands([{
      aliases: ['menu'],
      handler: function () {
        Code.expect(called).to.be.equal(1);
        done();
      }
    }])
    .execute(['menu', '--version=2']);
});

test('loadModifiers test', function (done) {
  var modifiers = commandico(null, 'menu')
    .loadModifiers(__dirname + '/../test_modifier')
    .modifiers;

  Code.expect(modifiers[0]).to.not.equal(null);
  done();
});

test('ordered multi command order test', function (done) {
  commandico(null, 'menu')
    .addCommands([{
        order: 1,
        aliases: ['menu'],
        handler: done
      }, {
        aliases: ['menu'],
        handler: function () {
          throw new Error('?');
        }
      }])
    .execute(['menu']);
});

test('add various orders', function (done) {
  commandico(null, 'menu')
    .addCommands([{
        order: 2,
        aliases: ['menu'],
        handler: done
      }, {
        order: 1,
        aliases: ['menu'],
        handler: function () {
          throw new Error('?');
        }
      }])
    .execute(['menu']);
});

test('add various orders', function (done) {
  commandico(null, 'menu')
    .addCommands([{
        aliases: ['menu'],
        handler: function () {
          throw new Error('?');
        }
      }, {
        order: 1,
        aliases: ['menu'],
        handler: done
      }])
    .execute(['menu']);
});
