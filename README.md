# BlendJS Core Class System

## About:
BlendJS is a full stack JavaScript Web Application Framework. At the moment It is in development
and in it's early stages.

But before BlendJS is ready for use I would like to release it's *classical* class system
to anyone who is interested. I hope you enjoy it and let me know if you happen to find
any bugs. Don't forget to give this project a star at npmjs.org :)

***IMPORTANT***: This repository is created to enable BlendJS's class system within Node.js.
It does not provide useful functionality in the browser. For the browser version you need
to use the BlendJS Web SDK!

## Getting Started:

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


