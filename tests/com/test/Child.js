Blend.defineClass('tests.com.test.Child', {
    extend: 'tests.com.Parent',
    contact: function () {
        var me = this;
        if (me.callParent) {
            return me.callParent.apply(me, arguments) + 1;
        } else {
            return 1;
        }
    }
});
