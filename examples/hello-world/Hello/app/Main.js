/*
 * The main class for this application.
 */
Blend.defineClass('Hello.app.Main', {
    requires: [
        'Hello.app.Greeter'
    ],
    run: function () {

        var greeter = Blend.create('Hello.app.Greeter', {
            entity: 'World'
        });

        greeter.sayHello();

    }
});