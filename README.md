jelly.js
========

jelly.js is a tiny library for module management.

It extends [module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript) so that 
you can improve reusability of modules.

jelly.js provides following functions.

jelly.module(name, fn)
----------------------

jelly.module defines a module. 

Modules is singleton objects which lifecycle is managed by jelly.js.

The first arguemnt is the name of a module.
The second argument is a function which defines a module.

You can define a module as following.

```javascript
jelly.module('Hello', function (def) {
    //This defines private variable
    var defaultName = 'World';

    function getName(name) {
        if (name) {
            return name;
        } else {
            return defaultName;
        }
    }

    //This defines public function
    def.sayHelloTo= function (name) {
        return 'Hello,' + getName(name) + '!';
    };
});
```

You can use the module as following.

```javascript
var hello = jelly.module('Hello');
console.log(hello.sayHelloTo('jelly')); //prints Hello, Jelly! 
```

In the first time the module is used, The function specified as second argument is called with the definition object.
You can define public members of the module by add properties to the definition object.

jelly.trait(name, fn)
---------------------

jelly.module function defines a trait. 

A trait is common properties which can be added to other objects.

The first arguemnt is the name of a module.
The second argument is a function which defines the trait.

You can define a trait as following.

```javascript
jelly.trait('Hello', function (def) {
    var name;

    def.setName = function (n) {
        name = n;
    }

    //public methods
    def.sayHello = function () {
        return 'Hello,' + getName(name) + '!';
    };
});
```


jelly.include(target, trait)
----------------------------------

Using jelly.include , you can mix-in properties defined by traits to any objects.

The first argument is a object to add properties defined by traits.
The second argument is the name of a trait.
  
The below example shows the way to create new instance of trait defined above.

```javascript
var hello = jelly.include({}, 'Hello');
hello.setName('jelly');
```

jelly.plugin(target, fn)
------------------------

jelly.plugin defines a plugin.
Plugins modify properties of modules or traits.

The first argument is the name of a trait or module to modify.
The second argument is a function which modify properties of the target module or trait.

The second argument function is called just after an instance of the target module or trait is created.

Please note that a plugin addition doesn't not affect existing instances of modules or traits. 

jelly.reset()
-------------

jelly.reset remove all instances of modules.

