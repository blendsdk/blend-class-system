BlendTest.defineTest('blend', 'foreach-exit', function (t) {
    var obj = {
        a: 2,
        b: 4,
        c: 6
    };

    var test = 0;


    Blend.foreach(obj, function (itm, key) {

        if (itm === 4) {
            return false;
        } else {
            test++;
        }
    });

    t.equal(test, 1, 'exited correctly');
    t.done();
});

BlendTest.defineTest('blend', 'is_boolean', function (t) {
    t.isTrue(Blend.isBoolean(true), 'is true');
    t.isTrue(Blend.isBoolean(false), 'is false');
    t.isFalse(Blend.isBoolean({}), '{} is not boolean');
    t.isFalse(Blend.isBoolean(null), 'null is not boolean');
    t.done();
});
