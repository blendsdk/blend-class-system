/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 BLENDJS.COM TrueSoftware B.V. (The Netherlands)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var $$ = function () {

    return function (host, globalNs) {

        var path = null; // nodejs

        /**
         * Check if we are running with nodejs
         * @returns {Boolean}
         */
        function isNodeJs() {
            //http://timetler.com/2012/10/13/environment-detection-in-javascript/;
            return (typeof exports !== 'undefined' && this.exports !== exports);
        }

        /**
         * Check if the given value is valid (not null or undefined)
         * @param {type} value
         * @return {unresolved}
         */
        function isvalid(value) {
            return !(value === null || value === undefined);
        }

        /**
         * Checks if the given argument is a javascript function
         * @param {type} value
         * @return {Boolean}
         */
        function is_function(value) {
            return typeof value === "function";
        }

        /**
         * Checks if the given argument is a javascript array
         * @param {type} value
         * @return {Boolean}
         */
        function is_array(value) {
            return Object.prototype.toString.apply(value) === '[object Array]';
        }

        /**
         * Checks if the given value is an object
         * @param {Object} value
         * @return {Boolean}
         */
        function is_object(value) {
            return (typeof (value) === "object" &&
                    !is_array(value) &&
                    !is_function(value) &&
                    !is_null(value) &&
                    !is_string(value)
                    );
        }
        /**
         * Checks is the given value is a string
         * @param {type} value
         * @returns {Boolean}
         */
        function is_string(value) {
            return typeof value === 'string';
        }

        /**
         * Checks is the given value is null or undefined
         * @param {type} value
         * @returns {Boolean}
         */
        function is_null(value) {
            return value === null || value === undefined;
        }

        /**
         * Implements an object iterator for the class builder
         * @param {type} object
         * @param {type} callback
         * @param {type} scope
         * @return {undefined}
         */
        function foreach(object, callback, scope) {
            var a;
            scope = scope || object;
            for (a in object) {
                callback.apply(scope, [object[a], a, object]);
            }
        }

        /**
         * clones an object
         * @param {Object} obj object to clone.
         * This method will not clone several buit-in types.
         */
        function clone(obj) {

            if (typeof HTMLElement === 'undefined') {
                var HTMLElement = function () {
                    //
                }
            }

            if (is_function(obj) || is_null(obj) || (obj instanceof RegExp) || (obj instanceof HTMLElement)) {
                return obj;
            }
            if (is_object(obj)) {
                var res = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        res[key] = clone(obj[key]);
                    }
                }
                return res;
            } else if (is_array(obj)) {
                var res = [];
                for (var key in obj) {
                    res.push(clone(obj[key]));
                }
                return res;
            } else {
                return obj;
            }
        }

        /**
         * Camel case an string
         */
        function camel_case(name) {
            if (Array.prototype.map) {
                return name.replace(/-|_/gi, '-').split('-').map(function (str) {
                    return str.charAt(0).toUpperCase() + str.substr(1);
                }).join('');
            } else {
                var p = name.replace(/-|_/gi, '-').split('-');
                foreach(p, function (str, k, all) {
                    p[k] = str.charAt(0).toUpperCase() + str.substr(1);
                });
                return p.join('');
            }
        }

        /**
         * Kind of a object property copier that is used when the classes are
         * initialized or extended.
         */
        function applyer(configs, scope, isclone, useSetter) {
            var cfgs = configs, val, setterFnName;
            isclone = isclone || false;
            useSetter = useSetter || false;
            foreach(cfgs, function (v, k) {
                if (k !== '_extending') {
                    val = isclone ? clone(v) : v;
                    if (!useSetter) {
                        scope[k] = val;
                    } else {
                        setterFnName = 'set' + camel_case(k);
                        if (scope[setterFnName] && is_function(scope[setterFnName]) && scope[setterFnName].length === 1) {
                            scope[setterFnName].apply(scope, [val]);
                        } else {
                            scope[k] = val;
                        }
                    }
                }
            }, scope);
        }

        /**
         * Internal function for building a class definition. This method is exposed
         * through the Blend object.
         */
        function define_class(definition) {
            var properties = {},
                    getset = null,
                    statics = {},
                    mixins = null,
                    del = true, mxinst,
                    classDb = this.classDb || this.Blend.ClassBuilder.classDb;



            /*
             * Check if an ivar is not one of the reserved named. The values below
             * are instruction command to the class system and cannot be part of
             * a class's ivars
             */
            var isValidPropertyName = function (value) {

                var v = value.toLowerCase(), notValid = [
                    'abstractClass',
                    'extend',
                    'override',
                    'singleton',
                    'requires',
                    '$category$' // implicit category idicator
                ];
                return notValid.indexOf(v) === -1 ? true : false;
            };

            /*
             * Internal function to build a getter and a setter function
             * The setter funtion will check and call an onPropertyChange
             * function if the newly created object has it. This functionality
             * will be used later in the framework for passing events when ivars
             * change.
             */
            var makeGetterSetter = function (memberName) {

                var name = camel_case(memberName),
                        gname = 'get' + name,
                        sname = 'set' + name;
                if (!definition[gname]) {
                    definition[gname] = (function (member) {
                        return function () {
                            return this[member];
                        };
                    }(memberName));
                }

                if (!definition[sname]) {
                    definition[sname] = (function (member) {
                        return function (value) {
                            var old = this[member];
                            this[member] = value;
                            if (this.onPropertyChange) {
                                this.onPropertyChange.apply(this, [member, value, old]);
                            }
                            return this;
                        };
                    }(memberName));
                }
            };

            /**
             * We will try to requires classes if we are running with nodejs
             */
            if (isNodeJs()) {

                var classes = [],
                        root, val,
                        props = [
                            'extend',
                            'requires',
                            'mixins',
                            'controllers',
                            'override'
                        ];

                foreach(props, function (propName) {
                    if (definition[propName]) {
                        val = definition[propName];
                        if (is_string(val)) {
                            classes.push(val)
                        } else if (is_array(val)) {
                            classes = classes.concat(val);
                        } else if (is_object(val)) {
                            foreach(val, function (v) {
                                classes.push(v);
                            });
                        }
                    }
                });

                foreach(classes, function (className) {

                    if (is_object(className) && className.$className$) {
                        className = className.$className$;
                    }

                    if (className !== 'Blend' &&
                            className !== "Blend.BaseClass") {
                        if (!classDb.isClassDefined(className)) {
                            if (className.indexOf('Blend.') !== -1) {
                                root = host.blendRoot;
                                className = className.replace('Blend.', '');
                            } else {
                                root = host.loadPath;
                            }

                            className = root + '/' + className.replace(/\./g, '/') + '.js';
                            try {
                                require(className);
                            } catch (e) {
                                console.error("Unable to load [" + className + '] automatically due:');
                                console.error(e);
                            }
                        }
                    }
                });
            }

            /*
             * The definition paremeter contains the __proto__ object.
             * We need this object to establish the correct inheritance chain.
             * We need to clean the paremeter for unwanted class definition
             * instructions.
             */
            foreach(definition, function (member, name) {
                del = true;
                if (name === 'mixins') {
                    mixins = member;
                } else if (name === 'configs') {
                    getset = member;
                } else if (name === 'statics') {
                    statics = member;
                } else if (is_function(member)) {
                    del = false;
                } else if (isValidPropertyName(name)) {
                    properties[name] = member;
                }
                if (del === true) {
                    delete(definition[name]);
                }
            });

            /*
             * Here we walk through the getset (properties) of a class definition.
             * if the members are not functions then we add them to the instanse
             * properties and buid a getter a dn a setter function for them.
             */
            if (getset) {
                foreach(getset, function (member, memberName) {
                    if (is_object(member) || is_array(member) || is_function(member)) {
                        throw new Error('Automatic property definition of ' + memberName + ' cannot be a function, an object, or an array!\nPlease assign "null" to the definitions and initialize it as you require in the init function.');
                    } else {
                        properties[memberName] = member;
                        makeGetterSetter(memberName);
                    }
                });
            }

            /*
             * here we partially instantiate the mixin object and assign it to
             * definition.mixins.xyz=inst. Then loop through the mixin members.
             * If the member does not exist in the definition and it is a function
             * then we wrap it in a function and add the new function to the
             * definition. If the member exists then we skip it since the user
             * should call it directly from the definition.mixins.xyz object
             */
            if (mixins) {
                foreach(mixins, function (mixin, mixinName) {
                    mxinst = mixin.$className$ ? mixin : make_extending_instance(mixin);
                    if (!definition.mixins) {
                        definition.mixins = {};
                    }
                    definition.mixins[mixinName] = mxinst;
                    foreach(mxinst, function (member, memberName) {
                        if (memberName === 'mixins') {
                            /**
                             * Handle the case where the mixin itself has mixins
                             */
                            foreach(member, function (mxValue, mxKey) {
                                definition.mixins[mxKey] = mxValue;
                            });
                        }
                        /**
                         * Do not override/replace the existing member.
                         */
                        if (!definition[memberName]) {
                            /**
                             * Of the member is a function then wrap it
                             */
                            if (is_function(member)) {
                                definition[memberName] = function () {
                                    return member.apply(this, arguments);
                                };
                            } else {
                                /**
                                 * Otherwise copy the member
                                 */
                                definition[memberName] = member;
                            }
                        }
                    });
                });
            }

            /*
             * Build and return a dynamic constructor function that will act as
             * our newly defined class
             */
            return (function (c, proto, p, s) {
                function B() {
                    var args = arguments.length !== 0 ? arguments[0] : {};
                    /*
                     * put the ivars into the class
                     */
                    c(p, this, true); // clone and useSetter
                    /*
                     * if we are not extending this class then apply the dynamic
                     * arguments that was provided by "new"
                     */
                    if (!args._extending) {
                        if (this.init) {
                            this.init.apply(this, arguments);
                        } else {
                            c(args, this);
                        }
                    }
                    return this;
                }

                /* setup the correct prototype chain */
                B.prototype = proto;

                /* setup the static members by directly assigning them to the
                 * constructor
                 */
                foreach(s, function (v, k) {
                    B[k] = v;
                });

                return B;

            }(applyer, definition, Object.create(properties), statics));

        }


        /**
         * Internal function for extending a class
         * [1] This function creates an extending instance from the parent.
         * [2] It checks if the functions has callParent in their body
         * [3] If yes the builds another function around that function with
         * proper handling of callParent method.
         *
         * Checking the body of function with a Regex came from John Resig's
         * Simple Inheritance example. THis implementation results the same but
         * it is implemented a bit differently.
         *
         */
        function extend_class(parentClass, definition) {
            var proto = make_extending_instance(parentClass);
            var usesCallParent = /xyz/.test(function () {
                xyz;
            }) ? /\bcallParent\b/ : /.*/;
            var parentize = function (nf, pf) {
                return function () {
                    /*
                     * Check if this function is called from another "overridden"
                     * function. If so then save the original callParent and restore
                     * it back when we are done. If this is the last overridden
                     * function in the call stack then delete the callParent object
                     * because we don't need it anymore.
                     *
                     * nf=new function
                     * pf=previous function
                     * ccp=current call parent
                     */
                    var r, ccp = this.callParent || null;
                    this.callParent = function (args) {
                        args = args || arguments;
                        if (arguments.length > 1) {
                            // we have a multi argument function on our hands, so we
                            // need to create an array from when.
                            args = arguments;
                        }
                        if (!is_array(args)) {
                            args = [args];
                        }
                        return pf.apply(this, args);
                    };
                    r = nf.apply(this, arguments);
                    if (ccp !== null) {
                        this.callParent = ccp;
                    } else {
                        delete this['callParent'];
                    }
                    return r;
                };
            };

            foreach(definition, function (v, k) {
                if (is_function(v) && is_function(proto[k]) && usesCallParent.test(v)) {
                    proto[k] = parentize(v, parentClass.prototype[k]);
                } else {
                    proto[k] = v;
                }
            });
            return define_class(proto);
        }

        /**
         * Creates an instance of a class by signaling it to
         * skip the member properties initialization process.
         */
        function make_extending_instance(clazz) {
            var found;
            if (is_string(clazz)) {
                found = get_class_by_name(clazz);
                if (found) {
                    clazz = found;
                } else {
                    throw new Error('Unable to instantiate ' + clazz);
                }
            }
            return new clazz({_extending: true});
        }

        /**
         * Looks up the global namespace to find a class by the given name
         */
        function get_class_by_name(name) {
            if (name) {
                var def = split_class_name(name);
                var ns = namespace(def.namespace);
                if (ns && ns[def.className]) {
                    return ns[def.className];
                }
            }
            return null;
        }

        /**
         * Given the classname "." separated, splid the name from it's namespace
         */
        function split_class_name(name) {
            var l = name.lastIndexOf('.'),
                    ns = name.substr(0, l),
                    cl;
            l = l === -1 ? 0 : l;
            cl = name.substr(l, name.length - l).replace('.', '');
            return {
                namespace: (ns === "" ? globalNs : ns),
                className: cl
            };
        }


        /**
         * Either create or return a namespace in the global namespace
         */
        function namespace(value) {
            var me = this, ns, n, i, p = globalNs;
            if (is_string(value)) {
                if (value === "") {
                    return globalNs;
                } else {
                    ns = value.split('.');
                    for (i = 0; i !== ns.length; i++) {
                        n = ns[i];
                        if (!is_object(p[n])) {
                            p[n] = {};
                        }
                        p = p[n];
                    }
                }
            }
            return p;
        }

        /*
         * Registry class for keeping track of class names,aliases, and
         * class overrides. This is for internal use and will not apear
         * in the documentation
         */
        function ClassDb() {

            this.classes = {};
            this.alias = {};
            this.abstractClass = {};

            this.isClassDefined = function (name) {
                return this.classes[name] !== undefined;
            };

            this.getClassByAlias = function (alias) {
                return (this.alias[alias] || null);
            };

            this.getClassByName = function (name) {
                return (this.classes[name] || null);
            };

            this.addAlias = function (alias, name) {
                var i, len;
                if (!isvalid(alias)) {
                    return false;
                }
                alias = is_array(alias) ? alias : [alias];
                len = alias.length;
                for (i = 0; i !== len; i++) {
                    this.alias[alias[i]] = name;
                }
                return true;
            };

            this.addAbstract = function (name) {
                if (this.classes[name]) {
                    this.abstractClass[name] = true;
                } else {
                    throw new Error('Class ' + name + ' is already defined');
                }
            }

            this.isAbstract = function (name) {
                return this.abstractClass[name] === true;
            }

            this.addClass = function (name) {
                if (!this.classes[name]) {
                    this.classes[name] = name;
                } else {
                    throw new Error('Class ' + name + ' is already defined');
                }
            };

            this.overrideClass = function (name, override) {
                if (this.classes[name]) {
                    this.classes[name] = override;
                } else {
                    throw new Error('Class ' + name + ' is not defined to be overidden!');
                }
            };
        }

        /**
         * Returns a class' alias if possible
         */
        function find_class_alias(classDef) {
            /*
             * [1] need to determine if the alias has an implicit category provided
             * in the classDef
             */
            if (is_null(classDef)) {
                return null;
            }

            var alias = (classDef.alias || classDef.type) || null;
            if (!is_null(alias) && is_string(alias)) {
                var hasCat = alias.indexOf('.') !== -1;
                if (!hasCat && classDef.$category$) {
                    alias = classDef.$category$ + '.' + alias;
                }
                return alias;
            } else {
                return null;
            }
        }

        /**
         * creates a class instanse by looking up its class name in the classDb
         */
        function create_class_instance(arg1, arg2) {
            var me = this, classConfig = null, clazz = null, impl = null;

            var findClazz = function (name) {
                var className = me.classDb.getClassByName(name) || me.classDb.getClassByName(me.classDb.getClassByAlias(name));
                if (!me.classDb.isAbstract(className)) {
                    return get_class_by_name(className) || null;
                } else {
                    throw new Error('Cannot instantiate abstract class ' + className);
                }
            }

            if (is_string(arg1)) {
                if (is_object(arg2)) {
                    /*
                     * Blend.create('classname',{specs});
                     */
                    classConfig = arg2;
                    clazz = findClazz(arg1);
                } else if (is_string(arg2)) {
                    /*
                     * Blend.create('classname','category'); OR
                     * Blend.create('alias','category');
                     */
                    clazz = findClazz(arg1) || findClazz(arg2 + '.' + arg1);
                    /*
                     * the second arg is ignored since it is not an object
                     */
                    classConfig = {};
                } else {
                    /*
                     * Blend.create('classname'); OR
                     * Blend.create('category.alias');
                     * Blend.create('alias'); WILL FAIL!
                     */
                    /*
                     * the second arg is ignored since it is not an object
                     */
                    classConfig = {};
                    clazz = findClazz(arg1);
                }
            } else if (is_object(arg1)) {
                /**
                 * Here we need to find the class by category and alias or
                 * if there is no category we will try to imply one!
                 */

                /**
                 * arg1 is the classConfig anyway
                 */
                classConfig = arg1;

                if (!is_null(arg2) && is_string(arg2)) {
                    /**
                     * Lets make a proxy object so the find_class_alias has
                     * something to work with
                     */
                    impl = {
                        type: arg1.type || arg1.alias,
                        $category$: arg2
                    };
                }

                clazz = findClazz(find_class_alias(arg1)) || findClazz(find_class_alias(impl));

            } else if (is_array(arg1)) {
                /*
                 * LOOP and
                 * create_class_instance.apply(this,arguments);
                 */

                var result = [];
                foreach(arg1, function (def) {
                    result.push(create_class_instance.apply(me, [def, arg2]));
                }, me);
                return result;
            }

            if (clazz && classConfig) {
                return new clazz(classConfig);
            } else {
                // ERROR OUT, BECAUSE WE DONT' KNOW WHAT TO DO
                if (is_object(arg1)) {
                    if (arg1.type) {
                        arg1 = arg1.type;
                    } else if (arg1.alias) {
                        arg1 = arg1.alias;
                    }
                } else if (is_function(arg1)) {
                    arg1 = 'function(){}';
                }
                throw new Error('Unable to instantiate from [' + arg1 + '] Have you defined the class or included in the requires:[] property?');
            }
        }

        /**
         * Internal function for crating a singleton
         */
        function register_singleton(className, clazz, ns, nameDef, skipinst, key) {
            var classNameSingleton = className + key, nameDefS = split_class_name(classNameSingleton);
            this.classDb.overrideClass(className, classNameSingleton);
            ns[nameDefS.className] = clazz;
            if (!skipinst) {
                ns[nameDef.className] = create_class_instance.apply(this, [className]);
            }
        }

        /**
         * Defines a class and makes sure it is registered correctly in the classDb
         * This function also handles the case of overridding a singleton class.
         *
         * Making the overriding a singleton class possible requires the class be
         * registered with a different name (singletonKey postfixed) and saved
         * with the altered name. Singleton are instantiated objects with the same
         * name at their class name. The renaming of a singleton here is required
         * to make their overriding possible.
         */
        function define_class_with_registry(className, classDef, postProcess) {
            var isAbstract, isExtend, isOverride, isSingleton, nameDef, doPostProcess = false,
                    ovname, singletonKey = '$$Singleton$$', forceSingleton = false;
            if (is_string(className)) {

                //Get rid of spaces in the class name
                className = className.trim();
                /**
                 * Small hack as part of the mechanisme to trick the metatool
                 * to automatically include this file;
                 */
                if (className === 'Blend.BaseClass') {
                    return BaseClass;
                }

                if (is_function(classDef)) {
                    classDef = classDef();
                }

                // figure out what the classDef wants to do
                classDef = clone(classDef) || {};
                classDef.$className$ = className;
                isExtend = classDef.extend ? true : false;
                isOverride = classDef.override ? true : false;
                isSingleton = classDef.singleton ? true : false;
                isAbstract = classDef.abstractClass ? classDef.abstractClass : false;
                if (!isSingleton && isOverride) {
                    /* If we are overriding a singleton we have to make sure the
                     * overriding class also gets instantiated after it is created
                     * and registered.
                     */
                    var toBeOverridden = this.classDb.getClassByName(classDef.override);
                    forceSingleton = (toBeOverridden && toBeOverridden.indexOf(singletonKey) !== -1);
                }
                nameDef = split_class_name(className);
                if (isExtend && isOverride) {
                    throw new Error('Cannot extend and override a class at the same time!');
                }
                if (!isOverride && !isExtend) {
                    isExtend = true;
                    classDef.extend = 'Blend.BaseClass';
                }
                if ((isOverride && isSingleton) && !forceSingleton) {
                    throw new Error('Overriding a class and making it singleton is not allowed!');
                }
                if (isSingleton && isAbstract) {
                    throw new Error('Singleton classes cannot be abstract!');
                }
                if (isExtend) {
                    var pclazz = get_class_by_name(this.classDb.getClassByName(classDef.extend) || classDef.extend),
                            clazz, ns;
                    if (pclazz) {
                        clazz = extend_class(pclazz, classDef);
                        ns = namespace(nameDef.namespace);
                        ns[nameDef.className] = clazz;
                        if (!this.classDb.getClassByName(className)) {
                            this.classDb.addClass(className);
                            this.classDb.addAlias(find_class_alias(classDef), className);
                        }
                        if (isAbstract) {
                            this.classDb.addAbstract(className);
                        }
                        if (isSingleton) {
                            /* only create an singleton instance if the newly defined class not extened from an
                             * singleton itself:
                             *
                             * [1] ClassA -> singleton  : register ClassA -> ClassA$$Key
                             * [2] ClassB -> override ClassA: register ClassA -> ClassB$$
                             * [3] Do not create an instace of ClassB$$ like Blend.ClassB$$
                             */
                            var skip = (this.classDb.getClassByName(classDef.extend) || classDef.extend).indexOf(singletonKey) !== -1;
                            register_singleton.apply(this, [className, clazz, ns, nameDef, skip, singletonKey]);
                        }
                        doPostProcess = true;
                    } else {
                        throw new Error(classDef.extend + ' is undefined!');
                    }
                } else if (isOverride) {
                    ovname = classDef.override;
                    delete(classDef['override']);
                    classDef.extend = this.classDb.getClassByName(ovname) || ovname;
                    if (forceSingleton) {
                        classDef.singleton = true;
                    }
                    define_class_with_registry.apply(this, [className, classDef, postProcess]);
                    this.classDb.overrideClass(ovname, this.classDb.getClassByName(className) || className);
                    if (forceSingleton) {
                        nameDef = split_class_name(ovname);
                        ns = namespace(nameDef.namespace);
                        ns[nameDef.className] = create_class_instance.apply(this, [className]);
                    }
                }
                if (doPostProcess && is_function(postProcess)) {
                    postProcess(ns[nameDef.className]);
                }
            } else {
                throw new Error('Invalid class definition parameters.');
            }
        }

        if (isNodeJs()) {
            path = require('path');
            host.loadPath = host.loadPath || path.resolve('./');
        }

        /*
         * expose the functions as public
         */
        host.ClassBuilder = {
            classDb: new ClassDb(),
            defineClass: define_class_with_registry,
            namespace: namespace,
            create: create_class_instance,
            camel_case: camel_case,
            clone: clone
        };

        /**
         * The base class of all classes in Blend. Please note that this class and
         * its declaration cannot be overridden or changed in anyway.
         */
        var BaseClass = define_class({
            requires: [
                'Blend'
            ],
            /**
             * class constructor
             */
            init: function (configs) {
                applyer(configs, this, false, false);
            }
        });

        host.BaseClass = BaseClass;
    }
}

if (typeof exports === 'undefined') {
    $$().apply(this, [this.Blend, this]);
} else {
    $$().apply(GLOBAL, [GLOBAL.Blend, GLOBAL]);
}
delete($$);
