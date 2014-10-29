#BlendJS Core Class System

##About:
BlendJS is a full stack JavaScript Web Application Framework. It is in development
and in it's early stages. I would like to release it's *classical* class system
for anyone that interested until BlendJS is ready for public release.
I hope you enjoy it and let me know if you happen to find any bugs.

##Getting Started:

BlendJS's class system implements and provides the following functionality.

* Define classes using ```Blend.defineClass(...)```.
* Instantiate objects from previously defined classes using ```Blend.create(...)```.
* Extend from existing classes to make custom and specialized classes.
* Class overriding, that is changing the current implementation of a class without really extending it.
* Singleton classes, which are classes that have only one instance and are instantiated automatically.
* Multiple inheritance using mixins. You can mix other classes into your own classes to achieve multiple inheritance.
* Function overriding, that is the ability to override a function and be able to call it's parent function.
* Static members. These are functions and properties attached to a class. Great to make utility classes.
* Automatic namespaces. BlendJS groups your classes into their corresponding namespaces without headache.
* Integration with NodeJS.

##1. Defining Classes
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

##2. Instantiating objects
To create or instantiate an object in BlendJS we make use of ```Blend.create(...)```
function, by providing it a class name and optionally an object as configuration to initialize it's
property values. For example:

```
var person = Blend.create('MyCRM.models.Person', {
    firstName: 'Jane',
    lastName: 'Eyre'
});

person.getFullname();
```

##3. Extending and the role of Blend.BaseClass.
In BlendJS you can create new classes by extending from other classes using the ```extend``` config.

So first let us see how we extend from our class ```MyCRM.models.Person``` class defined above:

```
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

BlendJS implicitly extends from ```Blend.BaseClass``` when you do not provide a
parent class like we did in ```MyCRM.models.Person```. For example:

```
Blend.defineClass('My.cool.Class', {
    // BlendJS extends automatically from Blend.BaseClass if you leave out the
    // extend:'...' directive
    extend: 'Blend.BaseClass',
    doCoolThings: function () {
        return;
    }
});
```

#4. The Class constructor
Every class in BlendJS can have a constructor. The class constructor in BlendJS
is the ```init(...)``` function. You can provide your own constructor when you define
a class. The only requirement is that you need to call the parent constructor to help
BlendJS handle things correctly. For example:

```
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

#5. Function overriding
Sometimes you need to implement custom functionality on a existing class function.
This is very easy in BlendJS. You just override the function, by create a function with the
same name, and if you happen to need to call the parent function you use the ```callParent``` utility.
In the example below we will make ```getFullname``` to return everything in uppercase:

```
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

#6. Class overriding
Overriding a class basically means the ability to change a class partially
or completely for your own needs. Class overriding is a great way to hot-fix a
class when you cannot deploy a new version, or when you need to have a function
behave differently without extending the class. Class overriding was introduced in
BlendJS to make ad-hoc fixes easier. Here is an example:

```
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
means that you can override functions and call their parent function just like when you
do extend a class.




