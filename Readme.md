# Commandico

A tiny - nodejs - command line tool that allows to cleanly create a command-line client. 

# Usage

add `commandico` to your package.json:

```
npm i commandico --save
```

then instanciate commadico:

```JavaScript
var commandico = require('commandico')
  , defaultCommand = 'help'
  , scope = {
    number: 2
  };

var app = commandico(scope, defaultCommand)
```

then give it some commands

```JavaScript
app.addCommands([{
    aliases: ['help'],
    handler: function (scope) {
        console.log(scope.number);
    }
}])
```

And further execute the script with some arguments

```JavaScript
app.execute(['hello world'])
```