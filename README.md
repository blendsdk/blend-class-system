[![Build Status](https://travis-ci.org/blendsdk/blend-class-system.svg?branch=master)](https://travis-ci.org/blendsdk/blend-class-system)

#BlendJS Core Class System

##About:
BlendJS is a full stack JavaScript Web Application Framework. At the moment It is in development
and in it's early stages.

But before BlendJS is ready for use I would like to release it's *classical* class system
to anyone who is interested. I hope you enjoy it and let me know if you happen to find
any bugs. Don't forget to give this project a star at npmjs.org :)

***IMPORTANT***: This repository is created to enable BlendJS's class system within Node.js.
It does not provide useful functionality in the browser. For the browser version you need
to use the BlendJS Web SDK!

##Getting Started:

BlendJS's class system implements and provides the following functionality.

* **Define classes** using ```Blend.defineClass(...)```.
* **Instantiate objects** from previously defined classes using ```Blend.create(...)```.
* **Extend** from existing classes to make custom and specialized classes.
* **Class overriding**, that is changing the current implementation of a class without really extending it.
* **Singleton classes**, which are classes that have only one instance and are instantiated automatically.
* **Multiple inheritance** using mixins. You can mix other classes into your own classes to achieve multiple inheritance.
* **Function overriding**, that is the ability to override a function and be able to call it's parent function.
* **Static members**. These are functions and properties attached to a class. Great to make utility classes.
* **Automatic namespaces**. BlendJS groups your classes into their corresponding namespaces without headache.
* **Automatic dependency resolving**. BlendJS (both Node.js and browser versions) automatically resolves class
dependencies so you don't need to use ```require``` all the time.
* **Integration with Node.js**

##Defining Classes
To define a class in BlendJS we make use of the ```Blend.defineClass(...)```
function, by providing it a FQDN class name and an implementation as a JS object.
For example:

````JavaScript
Blend.defineClass('MyCRM.models.Person', {
    /**
     * @type {string} A person's firstname
     */
    firstName: null,
    /**
     * @type {string} A person's lastname
     */
    lastName: null,
    /**
     * Gets the fullname of a person
     * @returns {String}
     */
    getFullname: function () {
        var me = this;
        return me.firstName + ' ' + me.lastName;
    }
});
```

##Instantiating Objects
To create or instantiate an object in BlendJS we make use of ```Blend.create(...)```
function, by providing it a class name and optionally an object as configuration to initialize it's
property values. For example:

````JavaScript
var person = Blend.create('MyCRM.models.Person', {
    firstName: 'Jane',
    lastName: 'Eyre'
});

person.getFullname();
```

##Extending Classes
In BlendJS you can create new classes by extending from other classes using the ```extend``` configuration
directive. In the following example we create new class called ```MyCRM.models.Employee``` by extending it
from ```MyCRM.models.Person```.

````JavaScript
Blend.defineClass('MyCRM.models.Employee', {
    /**
     * Where we extend from the Person class
     */
    extend: 'MyCRM.models.Person',
    /**
     * @type {string} A employee's department
     */
    department: null,
    /**
     * @type {string} A employee's base salary
     */
    baseSalary: 1000,
    /**
     * Let us return from information
     */
    getInfo: function () {
        var me = this;
        return me.getFullname() +
                ' makes $' + me.baseSalary +
                ' and works at ' + me.department;
    }
});

var employeeNoOne = Blend.create('MyCRM.models.Employee', {
    department: 'Sales',
    firstName: 'Johny',
    lastName: 'Bravo'
});

employeeNoOne.getInfo();
```

##Blend.BaseClass The Root Of All Classes

BlendJS implicitly extends from ```Blend.BaseClass``` when you do not provide a
parent class like we did in ```MyCRM.models.Person```. The ```Blend.BaseClass```
encapsulates important functionality when initializing and creating an object.

````JavaScript
Blend.defineClass('My.cool.Class', {
    // BlendJS extends automatically from Blend.BaseClass if you leave out the
    // extend:'...' directive
    extend: 'Blend.BaseClass',
    doCoolThings: function () {
        return;
    }
});
```

##The Class Constructor
Every class in BlendJS can have a constructor. The class constructor in BlendJS
is the ```init(...)``` function. You can provide your own constructor when you define
a class. The only requirement is that you need to call the parent constructor to help
BlendJS handle things correctly. For example:

````JavaScript
Blend.defineClass('MyCRM.models.Employee', {
    extend: 'MyCRM.models.Person',
    department: null,
    baseSalary: 1000,
    /**
     * Hey,..We have our own constructor now :)
     */
    init: function () {
        var me = this;
        // Let's call the parent constructor first.
        me.callParent.apply(me, arguments);

        // Now let's get down to business
        if (me.department === 'IT') {
            me.baseSalary += 2000;
        }
    }
});
```

***VERY IMPORTANT***: When overriding a class constructor (the ```init``` function)
you always need to call the parent constructor by ```this.callParent.apply(this,arguments)```,
otherwise the initialization functionality from the ```Blend.BaseClass``` will not be executed
correctly and you end up having a broken object!

##Function Overriding
Sometimes you need to implement custom functionality on a existing class function.
This is very easy in BlendJS. You just override the function, by creating a function with the
same name, and if you happen to need to call the parent function, you use the ```callParent``` utility.
In the example below we will make ```getFullname``` to return everything in uppercase:

````JavaScript
Blend.defineClass('MyCRM.models.Employee', {
    extend: 'MyCRM.models.Person',
    /**
     * Override from Person
     */
    getFullname: function () {
        var me = this,
                // call the parent getFullname function from the Person class
                fullName = me.callParent.apply(me, arguments);
        return fullName.toUpperCase();
    }
});
```

##Multiple Inheritance Using Mixins
TODO...

##Singletons

In BlendJS Singletons are objects that are automatically instantiated and exist
throughout the entire life-cycle of an application. Once you mark a class as
a ```singleton```, BlendJS creates an object with the same name as the class
itself and initializes that object to be used further. Please note that you
cannot create multiple instances of a singleton class. There can be only one
instance of a singleton:

```JavaScript
/**
 * Create a singleton
 */
Blend.defineClass('CRM.utils.Mailer', {
    // make this class a singleton
    singleton: true,
    sendMail: function (from, to, subject, message) {
        /// Send mail :)
    }
});


// Using singletons

Blend.defineClass('Some.Class', {
    doWork: function () {

        // Here is how we use the singleton
        CRM.utils.Mailer.sendMail(
                'me@example.com',
                'you@example.com',
                'message subject',
                'message body'
                );
    }
});
```

##Static Members
Normally class functions are only available when an object is instantiated from a class.
In contrast to class function, static functions and properties can directly be accessed
from the class itself. Static functions and properties can be best used to provide utility
functions or constants without the need for instantiation:

```JavaScript
Blend.defineClass('CrmApp.MessageBox', {
    /**
     * We define static properties like this
     */
    statics: {
        BUTTON_OK: 1,
        BITTON_CANCEL: 2,
        BUTTON_YES: 4,
        BUTTON_NO: 8,
        ICON_INFO: 'b-icon-info',
        ICON_WARN: 'b-icon-warn',
        ICON_ERROR: 'b-icon-error'
    },
    /**
     * Creates a modal message box
     */
    show: function (title, message, icon, button) {
        // This is an instanse function
    }
});

/**
 * Let's create a messagebox
 */
var msgBox = Blend.create('CrmApp.MessageBox');
msgBox.show(
        'Order',
        'Order creation complete',
        CrmApp.MessageBox.ICON_INFO,
        CrmApp.MessageBox.BUTTON_OK
        );
```

##Class Dependency Resolution
BlendJS includes a built-in class resolution systems that automatically resolves
and imports classes into your program. In Node.js this is done behind the scene.
For the browser version of BlendJS the ```blend build``` utility parses your
classes and compiles a list of every class (with their right order of inclusion)
to be loaded into a HTML page.

Class definition in BlendJS comes with a configuration directive called ```requires```
which is used by the dependency analyzer to import class dependencies. Here is how
it works in Node.js:

```JavaScript
Blend.defineClass('Builder.core.Main', {
    // These classes will be loaded automatically.
    // You don't need to call require(....)
    requires: [
        'Builder.utils.Resources',
        'Builder.utils.CommandLine',
        'Blend.mvc.Application'
    ],
    version: '2.0',
    run: function () {
        //....
        //....
    }
});
```
In the example above BlendJS will automatically call the ```require(...)``` method
to load the three dependencies defined in the ```required``` configuration directive.
To help BlendJS you need to put and create your class files in a directory order
identical to the class namespace. For example:

For ```App.data.Model``` we execute```require('/path/to/src/App/data/Model.js')```

For ```Blend.mvc.Application``` we execute ```require('/path/to/Blend/mvc/Application.js')```

**But that is not all!**
BlendJS also checks the following configuration directives to resolve dependencies:

``````JavaScript
/**
 * Automatically load:
 *
 *      extend, override, requires, mixins, and controllers
 */
Blend.defineClass('My.cool.Class', {
    extend: 'My.cool.BaseClass', // Get loaded automatically

    // These classes get loaded automatically
    requires: [
        'Blend.mvc.Model',
        'Blend.ui.Container'
    ],
    // mixins classes get loaded automatically
    mixins: {
        mvcProvider: 'Blend.mvc.Provider',
        mvcConsumer: 'Blend.mvc.Consumer',
        xmlProvider: 'My.cool.data.XmlProvider'
    },
    // These classes also get loaded automatically
    controllers: [
        'My.cool.mvc.ProfileController',
        'My.cool.mvc.BusinessController'
    ],
    /**
     * Does something
     */
    doSomething: function () {
        //....
        //....
    }
});
```

**One more thing!**
When running inside Node.js, you can instruct BlendJS to load your classes from a different location
than taking the current directory as the root location. This can be doe by:

```
Blend.loadPath = __dirname + '/path/to/my/classes/';
```

**BlendJS by default sets the value of ```Blend.loadPath``` to the folder of the file
where ```require('blend-class-system')``` was called for the first time!**

##Integration With Node.js

Node.js provides a very developer friendly ecosystem for developing JavaScript applications.
To use BlendJS’ class system in Node.js there is very little work on your part to get everything in motion.

####Get blend-class-system installed.
First of all you need to install ```blend-class-system```. In Node.js you either add ```blend-class-system``` to your dependencies and update your package or you just install using ```npm install```.

Let’s see how this goes:

Add ```blend-class-system``` to the dependencies of your package file then run ```npm update```
```JavaScript
{
    "name": "MyApp",
    .....
    "dependencies": {
        "blend-class-system": "*"
    }
}
```

Or just run ```npm install blend-class-system``` if you do not have a ```package.json``` for your project

Next you need to ```require('blend-class-system');``` in the main file of your project. You need to do this only
once. BlendJS will make itself available from the global scope of your Node.js application.

Here is an example from our HelloWorld application:

```JavaScript
// make BlendJS available
require('blend-class-system');

// create the main object
var app = Blend.create('Hello.app.Main');

// run this baby
app.run();

```

### Hello World
As a good tradition you can find a fancy Hello World application using the link below:
https://github.com/blendsdk/blend-class-system/tree/master/examples/

#Additional Functionality:

##Class Overriding
Overriding a class basically means the ability to change a class partially
or completely for your own needs. Class overriding is a great way to hot-fix a
class when you cannot deploy a new version, or when you need to have a function
behave differently without extending the class. Class overriding was introduced in
BlendJS to make ad-hoc fixes easier. Here is an example:

````JavaScript
var brokenEmployee = Blend.create('MyCRM.models.Employee');
brokenEmployee.baseSalary; // should be 1000;

/**
 * Now we override the class using the override directive
 */
Blend.defineClass('MyCRM.models.EmployeeHotFix', {
    override: 'MyCRM.models.Employee',
    baseSalary: 500
});

/**
 * Note that we are still using the 'MyCRM.models.Employee' class
 */
var fixedEmployee = Blend.create('MyCRM.models.Employee');
fixedEmployee.baseSalary; // should be 500;
```

BlendJS treats overridden classes like extended classes in all cases. This
means that you can override functions and call their parent function just like
when you do extend a class.
