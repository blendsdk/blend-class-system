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
    return function (blendroot) {

        /**
         * @class Blend is the global object of BlendJS. It is the root namespace and
         * provides all classes and singleton object in the Blend
         * @singleton
         */
        return {
            singleton: true,
            /**
             * The absolute path of where Blend's core files are located. This
             * variable is only set when Blend is running in nodejs
             */
            blendRoot: blendroot,
            /**
             * Wraps an object is an array if possible;
             * @param {object} obj the object to be wrapped
             * @returns {array} an array containing the object
             */
            wrapInArray: function (obj) {
                return Blend.isArray(obj) ? obj : Blend.isNullOrUndef(obj) ? [] : [obj];
            },
            /**
             * Converts an string to CamelCase
             * @param {string} value the string to be converted to CamelCase
             * @returns {string} return the CamelCase version if possible, otherwise
             * it eturns the original string
             */
            camelCase: function (value) {
                return this.ClassBuilder.camel_case.apply(this, arguments);
            },
            /**
             * Checks if the given object is instance of a class
             * @param {type} obj
             * @param {type} clazz
             * @returns {boolean}
             */
            isInstanceOf: function (obj, clazz) {
                if (Blend.isString(clazz)) {
                    var fn = new Function('', ' try { return ' + clazz + ' } catch(e) { return null };');
                    clazz = fn();
                }
                try {
                    var res = (obj instanceof clazz);
                    if (!res && obj.mixins) {
                        for (var k in obj.mixins) {
                            if (obj.mixins[k] instanceof clazz) {
                                return true;
                            }
                        }
                    }
                    return res;
                } catch (e) {
                    return false;
                }
            },
            /**
             * Check if the provided value is numeric
             * @param {type} value
             * @returns {Boolean}
             */
            isNumeric: function (value) {
                // Original source: JQuery
                return value - parseFloat(value) >= 0;
            },
            /**
             * Checks if the provided value is null or undefined.
             * @param {Object} value
             * @return {Boolean}
             */
            isNullOrUndef: function (value) {
                return (value === null || value === undefined);
            },
            /**
             * Checks to see whether a class is already defined.
             * @param {type} name
             * @returns {Boolean} returns true if the class is already defined, otherwise returns false.
             */
            isClassDefined: function (name) {
                return this.ClassBuilder.classDb.isClassDefined.apply(this.ClassBuilder.classDb, [name]);
            },
            /**
             * Utility function for finding and replacing placeholders in a string using
             * an object or array as data source. The placeholders are nested inside curly braces "{abc}".
             * @param {String} tmpl the string that acts as a template with placeholders.
             * @param {Array/Object} object or array using to replace the placeholders.
             */
            templateReplace: function (tmpl, data) {
                if (!Blend.isString(tmpl)) {
                    throw new Error('tmpl is not a string!');
                } else if (!Blend.isObject(data) && !Blend.isArray(data)) {
                    throw new Error('data is not an array or object');
                } else {
                    return tmpl.replace(/\{\w+\}/g, function (k) {
                        k = k.replace(/\{|\}/g, '');
                        if (data[k]) {
                            return data[k];
                        } else {
                            return null;
                        }
                    });
                }
            },
            /**
             * This function builds a javascript function that is based on a string template
             * for producing simple to complex HTML markup to be used as a template for Blend's UI components.
             * For more information see Blend's templating documentation.
             * @param {String/String[]} source string contains the source of the template
             * @return {Function} Function that is created based on the template source
             */
            buildTemplate: function () {
                var a = 0,
                        l = arguments.length,
                        source = [];
                for (a = 0; a !== l; a++) {
                    source.push(arguments[a].trim());
                }
                return new Function('data',
                        "var p=[];" +
                        "p.push('" +
                        source.join('').replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('")
                        + "');return p.join('');");
            },
            /**
             * Instantiates an object based on its class name. This method should be used
             * instead of the default javascript "new" keywoard. By using Blend.create
             * you make sure that your objects will be configured and instantiated correctly
             * to use Blend's class overriding, automatic properties, and the class inhertitance
             * chain.
             * @param {String} className the name of the class to create an object instance from.
             * @param {Object} configs the custom configuration that is going to be used to
             * set the various instance properties.
             */
            create: function () {
                return this.ClassBuilder.create.apply(this.ClassBuilder, arguments);
            },
            /**
             * Deeply clones an object.
             * @param {object} object object to be deeply cloned
             */
            clone: function () {
                return this.ClassBuilder.clone.apply(this.ClassBuilder, arguments);
            },
            /**
             * Defines a Blend based class.
             * @param {String} className the name of the class
             * @param {Object} classDef the class definition
             * @param {Function} postProcess a function athat is called after the class
             * is defined. This can be used to do additional operations after class definition.
             * @return {Boolean} true if the class was created successfully of throws exception.
             */
            defineClass: function () {
                this.ClassBuilder.defineClass.apply(this.ClassBuilder, arguments);
            },
            /**
             * Iterates through the elemnts of a given array or an object and calls the callback
             * function once for each item in the collection
             * @param {Object/Array} obj the object to iterate
             * @param {Function} callback function to call on each item
             * @param {Object} scope scope in which to call the callback function, default to undefined
             * @return {Object} returns the input object
             */
            foreach: function (obj, callback, scope) {

                if (typeof HTMLCollection === 'undefined') {
                    var HTMLCollection = function () {
                        //
                    }
                }

                var key;
                if (obj) {
                    if (Blend.isFunction(obj)) {
                        for (key in obj) {
                            if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
                                if (callback.call(scope, obj[key], key, obj) === false) {
                                    break;
                                }
                            }
                        }
                    } else if (Blend.isArray(obj)) {
                        for (key = 0; key < obj.length; key++) {
                            if (callback.call(scope, obj[key], key, obj) === false) {
                                break;
                            }
                        }
                    } else if (Blend.isInstanceOf(obj, HTMLCollection)) {
                        for (key in obj) {
                            if (obj.hasOwnProperty(key) && key !== 'length') {
                                if (callback.call(scope, obj[key], key, obj) === false) {
                                    break;
                                }
                            }
                        }
                    } else {
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                if (callback.call(scope, obj[key], key, obj) === false) {
                                    break;
                                }
                            }
                        }
                    }
                }
                return obj;
            },
            /**
             * Check if the provided parameter is a function
             * @param {Object} value
             * @return {Boolean} returns true if the given parameter is a function otherwise false
             */
            isFunction: function (value) {
                return (typeof value === 'function');
            },
            /**
             * This method creates a nested javascript object tree that can act as
             * a namespace for hosting other objects and properties. This method will not
             * overwrite existing namespaces.
             * @param {String} value namespace to be created
             * @param {Object} global the global object to be used as root
             * @return {Object} The namespace object was created or found.
             */
            namespace: function () {
                return this.ClassBuilder.namespace.apply(this.ClassBuilder, arguments);
            },
            /**
             * Checks if the given argument is an array
             * @param {Boolean} value object to test
             * @return {Boolean} returns true if the given parameter is an array otherwise false
             */
            isArray: function (value) {
                return Object.prototype.toString.apply(value) === '[object Array]';
            },
            /**
             * Checks if the given value is an object. This method returns false
             * when the given value is "null" or "undefined"
             * @param {Object} value
             * @return {Boolean} returns if the given parameter is an object otherwise false
             */
            isObject: function (value) {
                return (typeof value === "object" &&
                        (typeof value !== "function" &&
                                value !== null &&
                                value !== undefined &&
                                !Blend.isArray(value)));
            },
            /**
             * Checkes if the provided parameter is a string value
             * @param {String} value
             * @return {Boolean} returns true of the given parameter is a string otherwise false.
             */
            isString: function (value) {
                return  (typeof value === 'string');
            },
            /**
             * This method takes two objects and basiaclly copies the properies of the
             * source object into the target object
             * @param {object} target The target object to copy the properties to
             * @param {object} source The source object to copy the properties from
             * @param {boolean} overwrite If set to two if will overwrite the object properties. Defaults to false
             * @param {boolean} mergeArrays If set to true this function will merge there arrays. Defaults to false
             * @returns {object} returns the target object
             */
            apply: function (target, source, overwrite, mergeArrays) {
                var key;
                overwrite = overwrite || false;
                mergeArrays = mergeArrays || false;
                if (target && source) {
                    for (key in source) {
                        if (key) {
                            if (target[key] && Blend.isObject(target[key])) {
                                if (overwrite) {
                                    target[key] = source[key];
                                } else {
                                    Blend.apply(target[key], source[key]);
                                }
                            } else if (target[key] && Blend.isArray(target[key]) && mergeArrays === true) {
                                target[key] = target[key].concat(Blend.wrapInArray(source[key]));
                            } else if (target[key] && overwrite) {
                                target[key] = source[key];
                            } else if (Blend.isNullOrUndef(target[key])) {
                                target[key] = source[key];
                            }
                        }
                    }
                }
                return target;
            }
        }
    };
}

/**
 * Initialize the Blend's global object based on the environment it is running
 */
if (typeof exports === 'undefined') {
    // running in the browser
    this.Blend = $$().apply(this, []);
} else {
    // running in nodejs
    var path = require('path');
    GLOBAL.Blend = $$().apply(GLOBAL, [path.resolve(__dirname + '/../')]);
    require('./ClassBuilder.js');
}
delete($$);