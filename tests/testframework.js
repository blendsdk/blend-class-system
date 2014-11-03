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
    return function () {

        var me = this,
                allpass = 0,
                allfail = 0,
                tests = [],
                nextTest = 0,
                currentTest,
                started = false,
                testWindow = null,
                statusbar = null,
                last_message = null,
                messages = [];

        /**
         * Deel equal check of a value
         * @param {type} actual
         * @param {type} expected
         * @param {type} message
         * @returns {undefined}
         */
        this.equal = function (actual, expected, message) {
            var check = function (a, b) {
                if (get_obj_type(a) === get_obj_type(b)) {
                    if (is_array(a)) {
                        if (a.length === b.length) {
                            for (var i = 0; i !== a.length; i++) {
                                if (!check(a[i], b[i])) {
                                    return false;
                                }
                            }
                            return true;
                        } else {
                            return false;
                        }
                    } else if (is_object(a)) {
                        var akeys = Object.keys(a),
                                bkeys = Object.keys(a);
                        if (akeys.length === bkeys.length) {
                            for (var k in a) {
                                if (!check(a[k], b[k])) {
                                    return false;
                                }
                            }
                            return true;
                        } else {
                            return false;
                        }

                    } else if (is_function(a)) {
                        return a.length === b.length;
                    } else if (is_regexp(a)) {
                        throw new Error("Don't know how to compare RegExps!");
                    } else {
                        return a === b;
                    }
                } else {
                    return false;
                }
            };

            if (check(actual, expected)) {
                pass(message || currentTest.testn);
            } else {
                fail.apply(me, arguments);
            }
        };

        /**
         * Test for being TRUE
         * @param {type} actuall
         * @param {type} message
         * @returns {undefined}
         */
        this.isTrue = function (actuall, message) {
            if (actuall === true) {
                pass(message || currentTest.testn);
            } else {
                fail.apply(me, [actuall, true, message]);
            }
        };

        /**
         * Test for being FALSE
         * @param {type} actuall
         * @param {type} message
         * @returns {undefined}
         */
        this.isFalse = function (actuall, message) {
            if (actuall === false) {
                pass(message || currentTest.testn);
            } else {
                fail.apply(me, [actuall, false, message]);
            }
        };


        /**
         * Test for being null or undefined
         * @param {type} actuall
         * @param {type} message
         * @returns {undefined}
         */
        this.notOk = function (actuall, message) {
            if (actuall === null || actuall === undefined) {
                pass(message || currentTest.testn);
            } else {
                fail.apply(me, [actuall, 'null/undefined', message]);
            }
        };

        /**
         * Test for not being null or undefined
         * @param {type} actuall
         * @param {type} message
         * @returns {undefined}
         */
        this.ok = function (actuall, message) {
            if (actuall !== null && actuall !== undefined) {
                pass(message || currentTest.testn);
            } else {
                fail.apply(me, [actuall, 'not null/undefined', message]);
            }
        };

        /**
         * Define a test
         * @param {type} testGroup
         * @param {type} testName
         * @param {type} testFn
         * @returns {undefined}
         */
        this.defineTest = function (testGroup, testName, testFn) {
            tests.push({
                group: testGroup || 'latest',
                name: testName,
                fn: testFn,
                pass: 0,
                fail: 0,
                testn: 1
            });
        };


        /**
         * Cjeck if a value is almost the same as another. This is useful for
         * checking IE pixel-perfect diffs.
         * @param {type} actuall
         * @param {type} expected
         * @param {type} message
         */
        this.almost = function (actuall, expected, message) {
            if (is_number(actuall) && (get_obj_type(actuall) === get_obj_type(actuall))) {
                var v = Math.abs(actuall - expected);
                if ((v >= 0) && (v < 1)) {
                    pass(message || currentTest.testn);
                    return;
                }
            }
            fail.apply(me, arguments);
        };
        /**
         * Test for throwing an exception.
         * @param {function} actual
         * @param {String} expected
         * @param {type} message
         */
        this.throws_exception = function (actual, expected, message) {
            try {
                actual();
                fail.apply(me, arguments);
            } catch (e) {
                this.equal(e.message.replace("\n", ''), expected);
            }
        };

        /**
         * Run a function after a given delay, delay defaults to 500ms if
         * not provided
         * @param {type} fn
         * @param {type} amount
         */
        this.delay = function (fn, amount) {
            setTimeout(fn, amount || 500);
        };

        /**
         * To be called at the end of every test
         * @returns {undefined}
         */
        this.done = function () {
            if (currentTest.pass === 0 && currentTest.fail === 0) {
                this.log_warn('Nothing was tested!!!');
            }
            nextTest++;
            runNextTest();
        };

        /**
         * Check if we are running in nodejs
         * @returns {Boolean}
         */
        is_node = function () {
            return (typeof exports !== 'undefined' && this.exports !== exports);
        };


        /**
         * Check if the value is an array
         * @param {type} value
         * @returns {Boolean}
         */
        var is_array = function (value) {
            return Object.prototype.toString.apply(value) === '[object Array]';
        };

        /**
         * Check if the value is a function
         * @param {type} value
         * @returns {Boolean}
         */
        var is_function = function (value) {
            return typeof (value) === 'function';
        };

        /**
         * Check if the value is a string
         * @param {type} value
         * @returns {Boolean}
         */
        var is_string = function (value) {
            return typeof value === 'string';
        };

        /**
         * Check if the value is null or undefined
         * @param {type} value
         * @returns {Boolean}
         */
        var is_null = function (value) {
            return value === null || value === undefined;
        };

        /**
         * Check if the value is an object
         * @param {type} value
         * @returns {Boolean}
         */
        var is_object = function (value) {
            return (typeof (value) === "object" &&
                    !is_array(value) &&
                    !is_function(value) &&
                    !is_null(value) &&
                    !is_string(value)
                    );
        };

        /**
         * Check if the value is a number
         * @param {type} value
         * @returns {Boolean}
         */
        var is_number = function (value) {
            // Original source: JQuery
            return value - parseFloat(value) >= 0;
        };

        /**
         * Check if the value is a RegExp
         * @param {type} value
         * @returns {unresolved}
         */
        var is_regexp = function (value) {
            return (value instanceof RegExp);
        };

        /**
         * Get the string representation of an object type
         * @param {type} obj
         * @returns {String}
         */
        var get_obj_type = function (obj) {
            if (is_string(obj)) {
                return 'string';
            } else if (is_array(obj)) {
                return 'array';
            } else if (is_number(obj)) {
                return 'number';
            } else if (is_object(obj)) {
                return 'object';
            } else if (is_function(obj)) {
                return 'function';
            } else if (is_null(obj)) {
                return 'null';
            } else if (is_regexp(obj)) {
                return 'regexp';
            }
        };

        /**
         * Mark a message as PASS
         * @param {type} message
         * @returns {undefined}
         */
        var pass = function (message) {
            currentTest.pass++;
            allpass++;
            log_pass(message);
            currentTest.testn++;
        };

        /**
         * Mark a message as FAILED
         * @param {type} actual
         * @param {type} expected
         * @param {type} message
         * @returns {undefined}
         */
        var fail = function (actual, expected, message) {
            currentTest.fail++;
            allfail++;
            if (is_object(actual)) {
                actual = JSON.stringify(actual);
            }

            if (is_object(expected)) {
                expected = JSON.stringify(expected);
            }

            log_error((message || currentTest.testn) + ' : got [' + actual + '] expected [' + expected + ']');
            currentTest.testn++;
        };


        /**
         * Creates a log message either by creating an element or the by
         * returning the text itself in case of nodejs
         * @param {type} attrs
         * @returns {Element|String}
         */
        var mk_log = function (attrs) {
            if (currentTest && currentTest.name && attrs.text) {
                attrs.text = currentTest.name + " : " + attrs.text;
            }
            if (is_node()) {
                return attrs.text;
            } else {
                var el = document.createElement('DIV'), val;
                for (var attr in attrs) {
                    val = attrs[attr];
                    if (attr === 'cls') {
                        el.setAttribute('class', val);
                    } else if (attr === 'style') {
                        el.style = val;
                    } else if (attr === 'text') {
                        el.innerHTML = val;
                        last_message = val;
                    }
                }
                return el;
            }
        };

        var log_message = function (element) {
            messages.push(element);
        };

        var log_pass = function (message) {
            log_message(mk_log({text: message, cls: 'blend-test-log blend-test-pass-log'}));
        };

        var log_warn = function (message) {
            log_message(mk_log({text: message, cls: 'blend-test-log blend-test-warn-log'}));
        };


        var log_info = function (message) {
            log_message(mk_log({text: message, cls: 'blend-test-log blend-test-info-log'}));
        };

        var log_error = function (message) {
            log_message(mk_log({text: message, cls: 'blend-test-log blend-test-error-log'}));
            statusbar.innerHTML += "<span class='blend-test-error-log'>" + last_message + "</span>";
        };

        this.run = function () {

        };

        return this;
    };
};
/**
 * Initialize the BlendTest's global object based on the environment it is running
 */
if (typeof exports === 'undefined') {
    // running in the browser
    this.BlendTest = $$().apply(this, []);
} else {
    // running in nodejs
    var path = require('path');
    GLOBAL.BlendTest = $$().apply({}, []);
}
delete($$);
