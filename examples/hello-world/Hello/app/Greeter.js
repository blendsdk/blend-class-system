/**
 * pretty fancy for a Greeter Class, not?
 */
Blend.defineClass('Hello.app.Greeter', {
    entity: null,
    /**
     * Constructor example.
     * Don't forget to call the parent constructor
     */
    init: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.entity = me.entity || 'Someone';
    },
    sayHello: function () {
        var me = this;
        console.log(me.entity + ' says hello :)');
    }
});