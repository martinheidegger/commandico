'use strict'

const explicit = require('explicit')
const joi = require('@hapi/joi')

const command = joi.object({
  order: joi.number().integer().default(0).optional(),
  handler: joi.func().required(),
  filter: joi.func().optional(),
  aliases: joi.array().min(1).items(joi.string())
}).unknown()

const commands = joi.array().items(command)

const itemFilter = (scope, item) => typeof item.filter === 'function' ? item.filter(scope) : true

const loadFromFolder = (folder) => {
  var path = require('path')
  var fs = require('fs')
  return fs
    .readdirSync(folder)
    .filter(file => path.extname(file) === '.js')
    .map(file => {
      var name = file.substr(0, file.length - '.js'.length)
      var cmd = require(path.join(folder, name))
      if (!cmd.aliases) {
        cmd.aliases = []
      }
      cmd.aliases.unshift(name)
      return cmd
    })
}

const orderSort = (a, b) => {
  const orderA = a.order || 0
  const orderB = b.order || 0

  if (orderA > orderB) {
    return 1
  }
  if (orderA < orderB) {
    return -1
  }
  return 0
}

const Commandico = explicit({
  $one: true,
  $args: [
    joi.any().meta('scope'),
    joi.string().meta('default').required()
  ],
  $: function (scope, defaultCommand) {
    if (!(this instanceof Commandico)) {
      return new Commandico(scope, defaultCommand)
    }
    this.scope = scope
    this.defaultCommand = defaultCommand
    this.commands = []
    this.modifiers = []
  }
}).valid

Commandico.prototype = explicit({
  loadCommands: {
    $args: [joi.string().meta('folder').required()],
    $assert: true,
    $: function (folder) {
      return this.addCommands(loadFromFolder(folder))
    }
  },
  addCommands: {
    $args: [commands.meta('commands')],
    $assert: true,
    $: function (commands) {
      for (const command of commands) {
        this.commands.push(command)
      }
      return this
    }
  },
  loadModifiers: {
    $args: [joi.string().meta('folder').required()],
    $assert: true,
    $: function (folder) {
      return this.addModifiers(loadFromFolder(folder))
    }
  },
  addModifiers: {
    $args: [commands.meta('modifiers')],
    $assert: true,
    $: function (modifiers) {
      for (const modifier of modifiers) {
        this.modifiers.unshift(modifier)
      }
      return this
    }
  },
  getCommand: {
    $args: [joi.string().meta('name').allow(null).optional()],
    $assert: true,
    $: function (name) {
      if (name === null || name === undefined) {
        return null
      }
      const commands = this.commands.sort(orderSort)
      for (let i = commands.length - 1; i >= 0; i--) {
        var command = commands[i]
        if (!itemFilter(this.scope, command)) {
          continue
        }
        if (command.aliases.indexOf(name) !== -1) {
          return command
        }
      }
      return null
    }
  },
  execute: {
    $args: [joi.array().meta('args').default([]).optional()],
    $assert: true,
    $: function (args) {
      const mode = args[0]
      const argv = require('minimist')(args)
      const command = this.getCommand(mode) || this.getCommand(this.defaultCommand)
      this.modifiers
        .filter(itemFilter.bind(null, this.scope))
        .sort(orderSort)
        .forEach(item => {
          for (const alias of item.aliases) {
            const value = argv[alias]
            if (value !== undefined && value !== null) {
              item.handler(this.scope, value, alias)
            }
          }
        })

      if (!command) {
        throw new Error('default command not found')
      }

      command.handler(this.scope, argv._.slice(1))
    }
  }
})

module.exports = Commandico
