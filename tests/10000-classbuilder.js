BlendTest.defineTest('classbuilder', 'instance creation test', function (t) {
    Blend.defineClass('Test.INST1', {
        alias: 'my.inst1',
        cfg: 1
    });

    Blend.defineClass('Test.INST2', {
        extend: 'Test.INST1',
        alias: 'my.inst2'
    });

    var createAndCount = function () {
        var result = Blend.create.apply(Blend, arguments), count = 0;
        Blend.foreach(result, function (obj) {
            if (Blend.isInstanceOf(obj, Blend.BaseClass)) {
                count++;
            }
        });
        return count;
    }

    /**
     * With class name provided
     */
    t.equal(Blend.create('Test.INST1', {cfg: 10}).cfg, 10, 'className {spec}');
    t.equal(Blend.create('Test.INST1').cfg, 1, 'className (undefined)');
    t.equal(Blend.create('Test.INST1', 'abc').cfg, 1, 'className (string:incorrect!)');

    /**
     * With alias provided
     */
    t.equal(Blend.create('my.inst1', {cfg: 10}).cfg, 10, 'className {spec}');
    t.equal(Blend.create('my.inst1').cfg, 1, 'className (undefined)');
    t.equal(Blend.create('my.inst1', 'abc').cfg, 1, 'className (string:incorrect!)');

    /**
     * With alias and category separated
     */
    t.equal(Blend.create('inst1', 'my').cfg, 1, 'className (string:incorrect!)');

    /**
     * With spec and full alias
     */
    t.equal(Blend.create({type: 'my.inst1', cfg: 10}).cfg, 10, '{spec:type},null');
    t.equal(Blend.create({alias: 'my.inst1', cfg: 10}).cfg, 10, '{spec:alias},null');
    t.equal(Blend.create({alias: 'inst1', cfg: 10}, 'my').cfg, 10, '{spec:alias},imply');
    t.equal(Blend.create({alias: 'Test.INST1', cfg: 10}).cfg, 10, '{spec:fullclass},null');
    t.equal(Blend.create({alias: 'Test.INST1', cfg: 10}, 'my').cfg, 10, '{spec:fullclass},imply');


    t.equal(createAndCount(['Test.INST1', 'Test.INST2']), 2, 'array with full classname');
    t.equal(createAndCount(['my.inst1', 'my.inst2']), 2, 'array with full alias');
    t.equal(createAndCount(['inst1', 'inst2'], 'my'), 2, 'array with implicit category');
    t.equal(createAndCount([{type: 'inst1'}, {type: 'inst2'}], 'my'), 2, 'array with implicit category and spec obj');

    t.throws_exception(function () {
        t.equal(createAndCount([{type: 'inst1'}, {type: 'inst2'}]), 2, 'array with implicit category and spec obj');
    }, 'Unable to instantiate from [inst1] Have you defined the class or included in the requires:[] property?', 'unable to create object test');

    t.done();

});



BlendTest.defineTest('classbuilder', 'class does not exist', function (t) {

    t.throws_exception(function () {
        Blend.defineClass('Class1', {
            extend: 'Test.class.does.not.extst.A',
            override: 'Test.class.does.not.extst.B'
        });
    }, 'Cannot extend and override a class at the same time!', 'extend and override at the same time');

    t.throws_exception(function () {
        Blend.defineClass('Class1', {
            extend: 'Test.class.does.not.extst.B'
        });
    }, 'Test.class.does.not.extst.B is undefined!', 'extend from undefined class');

    t.done();
});


BlendTest.defineTest('classbuilder', 'class builder post process', function (t) {
    var didPostProcess = false;
    Blend.defineClass('Test.Class1');
    Blend.defineClass('Test.Class2', {}, function () {
        didPostProcess = true;
    });

    t.ok(didPostProcess, 'didPostProcess');
    t.done();
});

BlendTest.defineTest('classbuilder', 'class create inst', function (t) {
    Blend.defineClass('Test.Clazz', {
        fn: function () {
            return true;
        },
        fn2: function () {
            return this.X;
        }
    });

    var z1 = Blend.create('Test.Clazz');
    t.ok((z1 instanceof Test.Clazz), 'create int by class name');

    var z2 = Blend.create('Test.Clazz', {X: 'Y'});
    t.equal(z2.fn2(), 'Y', 'passed args');

    t.throws_exception(function () {
        Blend.create('Test.Z1')
    }, 'Unable to instantiate from [Test.Z1] Have you defined the class or included in the requires:[] property?', 'unable to create object from missing class');

    t.done();
});


BlendTest.defineTest('classbuilder', 'class override', function (t) {
    Blend.defineClass('Test.ClassX', {
        say: function () {
            return 'x';
        }
    });

    Blend.defineClass('Test.override.ClassX', {
        override: 'Test.ClassX',
        say: function () {
            return this.callParent().toUpperCase();
        }
    });


    Blend.defineClass('Test.override.ClassX2', {
        override: 'Test.ClassX',
        say: function () {
            return this.callParent().toUpperCase() + 'X';
        }
    });

    var x = Blend.create('Test.ClassX');

    t.ok((x instanceof Test.ClassX), 'ClassX inst');
    t.ok((x instanceof Test.override.ClassX), 'ClassX inst');
    t.ok((x instanceof Test.override.ClassX2), 'ClassX inst');

    t.equal(x.say(), 'XX', 'overridden call result (XX)');
    t.done();

});


BlendTest.defineTest('classbuilder', 'override the init function', function (t) {

    Blend.defineClass('Test.override2.Class1', {
        data_a: null,
        data_b: null,
        init: function () {
            var me = this;
            me.callParent.apply(me, arguments);
            me.data_a = 1;
            me.data_b = 2;
        },
        getData: function () {
            var me = this;
            return me.data_a + me.data_b;
        }
    });

    Blend.defineClass('Test.override2.override.Class1', {
        override: 'Test.override2.Class1',
        init: function () {
            var me = this;
            me.callParent.apply(me, arguments);
            me.data_b = 3;
        }
    });


    var obj = Blend.create('Test.override2.Class1');

    t.equal(4, obj.getData(), 'init has been overridden');

    t.done();
});


BlendTest.defineTest('classbuilder', 'inheritance chain', function (t) {


    Blend.defineClass('Test.C1');
    Blend.defineClass('Test.C2', {
        ivar1: 1,
        fn: function () {
            return 1;
        }

    });

    Blend.defineClass('Test.C21', {
        extend: 'Test.C2',
        fn21: function () {
        }
    });

    Blend.defineClass('Test.C211', {
        extend: 'Test.C21'
    });

    t.equal(Test.C1 == Test.C2, false, 'different classes');

    var c1 = new Test.C1();
    var c2 = new Test.C2();
    var c3 = new Test.C21();
    var c4 = new Test.C211();

    t.equal(Blend.isInstanceOf(c1, Test.C1), true, 'inst of C1');
    t.equal(Blend.isInstanceOf(c2, Test.C2), true, 'inst of C2');
    t.equal(Blend.isInstanceOf(c3, Test.C21), true, 'inst of C21');
    t.equal(Blend.isInstanceOf(c3, Test.C2), true, 'inst of C2 as second');
    t.equal(Blend.isInstanceOf(c4, Test.C21), true, 'inst of C2 as second thord');
    t.equal(Blend.isInstanceOf(c4, Test.C2), true, 'inst of C2 as second forth');
    t.equal(Blend.isInstanceOf(c1, Test.C1), true, 'inst of c1');

    t.done();
});


BlendTest.defineTest('classbuilder', 'overridden member calls overridden member', function (t)
{
    Blend.defineClass('Test.BaseClass', {
        ivar1: 'A',
        ivar2: 'B',
        fn1: function () {
            return this.ivar1;
        },
        fn2: function () {
            return this.ivar2;
        },
        status: function () {
            return this.fn1() + this.fn2();
        }
    });

    var b1 = new Test.BaseClass();
    t.equal(b1.status(), 'AB', 'base class ok');

    Blend.defineClass('Test.Class1', {
        extend: 'Test.BaseClass',
        fn1: function () {
            var A = this.callParent(); //A
            return A + 'p'; //Ap
        },
        fn2: function () {
            var Ap = this.fn1(); //Ap
            return this.callParent() + 'x' + Ap; //BxAp
        }
    });

    var c1 = new Test.Class1();
    t.equal(c1.fn2(), 'BxAp', 'called overridden from overridden');

    t.done();
});

BlendTest.defineTest('classbuilder', 'static members', function (t) {
    Blend.defineClass('Test.Util', {
        hello: function (name) {
            return 'hello ' + name
        },
        statics: {
            UP: 1,
            DOWN: 2,
            LEFT: 3,
            RIGHT: 4,
            MAKE_NODE: function (name) {
                return name.toUpperCase();
            }
        }
    });

    t.equal(Test.Util.UP, 1, 'static property');
    t.equal(Test.Util.MAKE_NODE('a'), 'A', 'static function');

    var u1 = new Test.Util();
    t.equal(u1.hello('joe'), 'hello joe', 'instance of a class with static members');

    t.done();
});

BlendTest.defineTest('classbuilder', 'namespace creaton', function (t) {
    Blend.namespace('Test.NS1');
    t.equal(typeof (Test.NS1), 'object', 'namespace');
    t.done();
});

BlendTest.defineTest('classbuilder', 'automatic getter setter (with override)', function (t) {
    Blend.defineClass('Test.Person', {
        configs: {
            firstname: 'john',
            lastname: 'doe',
            date_of_birth: null
        },
        fullname: function () {
            return this.firstname + ' ' + this.lastname;
        },
        onPropertyChange: function (p, o, n) {
            //console.log(p, o, 'chnaged to', n);
        }
    });

    t.ok(Blend.isFunction(Test.Person.prototype.getFirstname), 'getter fname');
    t.ok(Blend.isFunction(Test.Person.prototype.setFirstname), 'setter fname');
    t.ok(Blend.isFunction(Test.Person.prototype.getDateOfBirth), 'getter date_of_birth');
    t.ok(Blend.isFunction(Test.Person.prototype.setDateOfBirth), 'setter date_of_birth');

    var p1 = new Test.Person({
        firstname: 'Sally'
    });

    p1.setLastname('Doe');
    t.equal(p1.fullname(), 'Sally Doe', 'setter test');
    t.equal(p1.getFirstname(), 'Sally', 'getter test');

    Blend.defineClass('Test.PersonShout', {
        extend: 'Test.Person',
        setLastname: function (value) {
            this.callParent.apply(this, [value.toUpperCase()]);
        }
    });

    var ps1 = new Test.PersonShout();
    ps1.setLastname('jobs');
    ps1.setFirstname('steve');
    t.equal(ps1.fullname(), 'steve JOBS', 'getter override');

    Blend.defineClass('Test.PersonShoutReverse', {
        extend: 'Test.PersonShout',
        getLastname: function (value) {
            return this.callParent.apply(this).split("").reverse().join("");
        }
    });

    var psr1 = new Test.PersonShoutReverse();
    t.equal(psr1.getLastname(), 'eod', 'getter of overridden getter');

    t.done();

});


BlendTest.defineTest('classbuilder', 'mixins', function (t) {

    Blend.defineClass('Test.Digestable', {
        belly: [],
        eat: function (food) {
            this.belly.push(food);
        },
        digest: function () {
            this.belly = [];
        }
    });

    Blend.defineClass('Test.Digestable2', {
        extend: 'Test.Digestable',
        digest: function () {
            this.callParent.apply(this, []);
            this.belly.push('acids');
            this.belly.push('water');
        }

    });

    Blend.defineClass('Test.Being', {
        mixins: {
            digestable: 'Test.Digestable2'
        }
    });

    var b1 = new Test.Being();
    b1.eat('apple');
    t.equal(b1.belly.length, 1, "mixin function");
    b1.digest();
    t.equal(b1.belly.join(), 'acids,water', "mixin function");
    t.done();
});

BlendTest.defineTest('classbuilder', 'instance variables', function (t) {

    Blend.defineClass('Test.AClass', {
        prop1: null,
        prop2: null,
        prop3: null
    });

    var v1 = new Test.AClass({
        prop1: 1,
        prop2: [],
        prop3: {
            k: 3
        }
    });

    var v2 = new Test.AClass({
        prop1: 1,
        prop2: [],
        prop3: {
            k: 3
        }
    });
    v1.prop2.push(1);
    t.equal(v1.prop2.length, 1, 'len 1');
    t.equal(v2.prop2.length, 0, 'len 0');
    v2.prop3.k = 2;
    v1.prop3.k = 5;
    t.equal(v1.prop3.k, 5, 'obj man test');
    t.equal(v2.prop3.k, 2, 'obj man test 2');

    t.done();
});


BlendTest.defineTest('classbuilder', 'class by alias', function (t) {
    Blend.defineClass('Test.ClazzAL', {
        alias: 'class-al',
        name: null,
        fn: function () {
            return this.name.toUpperCase();
        }
    });

    var c = Blend.create({
        type: 'class-al',
        name: 'sally'
    });

    t.ok(c, 'object created');
    t.equal(c.fn(), 'SALLY', 'control');

    Blend.defineClass('Test.override.ClazzAL', {
        override: 'Test.ClazzAL',
        name: null,
        fn: function () {
            return this.name.toUpperCase() + ' Doe';
        }
    });

    var d = Blend.create({
        type: 'class-al',
        name: 'sally'
    });

    t.ok(d, 'object created');
    t.equal(d.fn(), 'SALLY Doe', 'control');


    t.throws_exception(function () {
        Blend.create();
    }, 'Unable to instantiate from [undefined] Have you defined the class or included in the requires:[] property?');

    t.throws_exception(function () {
        Blend.create({});
    }, 'Unable to instantiate from [[object Object]] Have you defined the class or included in the requires:[] property?');

    t.throws_exception(function () {
        Blend.create(undefined);
    }, 'Unable to instantiate from [undefined] Have you defined the class or included in the requires:[] property?');

    t.throws_exception(function () {
        Blend.create('');
    }, 'Unable to instantiate from [] Have you defined the class or included in the requires:[] property?');

    t.throws_exception(function () {
        Blend.create(1);
    }, 'Unable to instantiate from [1] Have you defined the class or included in the requires:[] property?');

    t.throws_exception(function () {
        Blend.create(function () {
        });
    }, 'Unable to instantiate from [function(){}] Have you defined the class or included in the requires:[] property?');

    t.done();

});


BlendTest.defineTest('classbuilder', 'automatic property change', function (t) {
    var changes = 0;
    Blend.defineClass('Test.PersonX', {
        configs: {
            firstname: 'john',
            lastname: 'doe',
            date_of_birth: null
        },
        fullname: function () {
            return this.firstname + ' ' + this.lastname;
        },
        onPropertyChange: function (p, o, n) {
            changes++;
        }
    });

    var p = new Test.PersonX();
    p.setFirstname('a');
    p.setLastname('a');
    p.setDateOfBirth('a');
    t.equal(changes, 3, 'onPropertyChange count');
    t.equal(p.fullname(), 'a a', 'control');
    t.done();
});

BlendTest.defineTest('classbuilder', 'extend from root', function (t) {
    Blend.defineClass('Test.X2', {
        extend: 'Blend.BaseClass'
    });
    t.ok(Test.X2, 'class defined');
    t.done();
});

BlendTest.defineTest('classbuilder', 'singleton', function (t) {

    Blend.defineClass('Test.X3', {
    });

    t.throws_exception(function () {
        Blend.defineClass('Test.override.X3', {
            override: 'Test.X3',
            singleton: true
        });
    }, 'Overriding a class and making it singleton is not allowed!');


    Blend.defineClass('Test.Util2', {
        singleton: true,
        greet: function () {
            return 'hello';
        }
    });

    t.ok(Test.Util2.greet, 'singleton instantiated');
    t.equal(Test.Util2.greet(), 'hello', 'singleton fn call');

    Blend.defineClass('Test.override.Util2', {
        override: 'Test.Util2',
        greet: function () {
            return this.callParent().toUpperCase();
        }
    });

    t.equal(Test.Util2.greet(), 'HELLO', 'overridden singleton fn call');

    Blend.defineClass('Test.override.Util2_Fix', {
        override: 'Test.Util2',
        greet: function () {
            return this.callParent().toUpperCase() + 'FIX';
        }
    });

    t.equal(Test.Util2.greet(), 'HELLOFIX', 'overridden overridden singleton fn call');

    Blend.defineClass('Test.override.Util2_FixFux', {
        override: 'Test.Util2',
        greet: function () {
            return this.callParent().toUpperCase() + 'FUX';
        }
    });

    t.equal(Test.Util2.greet(), 'HELLOFIXFUX', 'overridden overridden overridden singleton fn call');
    t.done();

});


BlendTest.defineTest('classbuilder', 'init call parent', function (t) {
    Blend.defineClass('Test.ParentTest', {
        init: function () {
            this.callParent.apply(this, []);
        }
    });

    var p = Blend.create('Test.ParentTest');
    t.ok(p);
    t.done();
});


BlendTest.defineTest('classbuilder', 'ivars setter', function (t) {

    Blend.defineClass('Test.IVAR', {
        prop: [],
        obj: {
            k: 0
        }
    });

    var p = Blend.create('Test.IVAR');
    var q = Blend.create('Test.IVAR');
    p.prop.push(1);
    p.obj.k++;

    q.prop.push(1);
    q.prop.push(1);
    q.obj.k = 10;
    t.equal(p.prop.length, 1, 'ivar test 1');
    t.equal(p.obj.k, 1, 'object ivar 1');
    t.equal(q.prop.length, 2, 'ivar test 2');
    t.equal(q.obj.k, 10, 'object ivar 2');
    t.done();
});


BlendTest.defineTest('classbuilder', 'mixin existing members', function (t) {
    Blend.defineClass('Test.mxtest.Mixin0', {
        hello: null,
        init: function () {
            this.callParent.apply(this, arguments);
            this.hello = 'Hello';
        },
        getHello: function () {
            return this.hello;
        }
    });

    Blend.defineClass('Test.mxtest.Mixin1', {
        extend: 'Test.mxtest.Mixin0',
        getHello: function () {
            return this.callParent.apply(this, arguments).toUpperCase();
        }
    });


    Blend.defineClass('Test.mxtest.Class1', {
        mixins: {
            mx1: 'Test.mxtest.Mixin1'
        },
        init: function () {
            this.callParent.apply(this, arguments);
            this.mixins.mx1.init.apply(this, arguments);
        }
    });

    var x = Blend.create('Test.mxtest.Class1');
    t.equal(x.getHello(), 'HELLO');
    t.equal(x.$className$, 'Test.mxtest.Class1');
    t.done();
});

BlendTest.defineTest('classbuilder', 'extend from a class with mixin', function (t) {
    Blend.defineClass('Test.x.Mixin', {
        hello: function () {
            return 'hello'
        }
    });

    Blend.defineClass('Test.x.Base', {
        mixins: {
            mix1: 'Test.x.Mixin'
        },
        init: function () {
            this.callParent.apply(this, arguments);
            this.mixins.mix1.init.apply(this, arguments);
        },
        HelloWorld: function () {
            return this.hello() + ' world!';
        }
    });

    Blend.defineClass('Test.x.User', {
        extend: 'Test.x.Base'
    });

    var b = Blend.create('Test.x.User');
    t.equal(b.HelloWorld(), 'hello world!', 'sanity test');
    t.done();
});


BlendTest.defineTest('classbuilder', 'multi mixin', function (t) {
    Blend.defineClass('Test.mm.Mixin1', {
        m1: function () {
            return 1;
        }
    });
    Blend.defineClass('Test.mm.Mixin2', {
        m2: function () {
            return 2;
        }
    });
    Blend.defineClass('Test.mm.Base', {
        mixins: {
            m1: 'Test.mm.Mixin1'
        }
    });

    Blend.defineClass('Test.mm.Derived', {
        extend: 'Test.mm.Base',
        mixins: {
            m2: 'Test.mm.Mixin2'
        },
        test: function () {
            var me = this;
            return me.mixins.m1.m1() + me.mixins.m2.m2();
        }
    });

    var d = Blend.create('Test.mm.Derived');

    t.equal(d.test(), 3, 'base class has mixin, derived class has mixin');
    t.done();
});

BlendTest.defineTest('classbuilder', 'extend from component with mixins and self having mixins', function (t) {
    Blend.defineClass('Test.MMX.Mx1', {
        v1: null,
        init: function () {
            this.v1 = 1;
        }
    });
    Blend.defineClass('Test.MMX.Mx2', {
        v2: null,
        init: function () {
            this.v2 = 1;
        }
    });
    Blend.defineClass('Test.MMX.Mx3', {
        v3: null,
        init: function () {
            this.v3 = 1;
        }
    });
    Blend.defineClass('Test.MMX.Mx4', {
        v4: null,
        init: function () {
            this.v4 = 1;
        }
    });
    Blend.defineClass('Test.MMX.C1', {
        mixins: {
            mx1: 'Test.MMX.Mx1',
            mx2: 'Test.MMX.Mx2',
            mx3: 'Test.MMX.Mx3'
        },
        init: function () {
            var me = this;
            me.callParent.apply(me, arguments);
            me.mixins.mx1.init.apply(me, arguments);
            me.mixins.mx2.init.apply(me, arguments);
            me.mixins.mx3.init.apply(me, arguments);
        }
    });

    Blend.defineClass('Test.MMX.C2', {
        extend: 'Test.MMX.C1',
        mixins: {
            mx4: 'Test.MMX.Mx4'
        },
        init: function () {
            var me = this;
            me.callParent.apply(me, arguments);
            me.mixins.mx4.init.apply(me, arguments);
        }
    });

    var o = Blend.create('Test.MMX.C2');
    t.ok(o.v1, 'ok mx1');
    t.ok(o.v2, 'ok mx2');
    t.ok(o.v3, 'ok mx3');
    t.ok(o.v4, 'ok mx4');
    t.done();
});


BlendTest.defineTest('classbuilder', 'class with private methods', function (t) {

    Blend.defineClass('Private.example.Class', function () {

        var private_add = function (a, b) {
            return a + b;
        };
        var private_mult = function (a, b) {
            return a * b;
        };

        return {
            init: function () {
                var me = this;
                me.callParent.apply(me, arguments);
            },
            calculate: function (a, b) {
                return private_mult(private_add(a, b), private_add(a, b));
            }
        };
    });
    var c = Blend.create('Private.example.Class');
    t.equal(c.calculate(2, 2), 16, 'public method');
    t.notOk(c.private_add, 'no access private_add');
    t.notOk(c.private_mult, 'no access private_mult');
    t.done();
});

BlendTest.defineTest('classbuilder', 'singleton and abstract class', function (t) {

    t.throws_exception(function () {

        Blend.defineClass('Test.abstract.Singleton', {
            abstractClass: true,
            singleton: true
        });

    }, 'Singleton classes cannot be abstract!', 'abstract singleton');

    t.done();

});

BlendTest.defineTest('classbuilder', 'instantiate abstract class', function (t) {

    Blend.defineClass('Test.abstract.MyAbstract', {
        abstractClass: true
    });

    t.throws_exception(function () {
        Blend.create('Test.abstract.MyAbstract');
    }, 'Cannot instantiate abstract class Test.abstract.MyAbstract', 'abstract instanse');


    t.equal(1, 2, 'failed test');

    t.done();

});
