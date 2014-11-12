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
});