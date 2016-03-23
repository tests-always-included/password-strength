/**
 * This is an object oriented approach of rumkin.com/passchk.js
 * Originally written to be self contained this makes it as an object
 * which can be instanciated.
 *
 *
 */
// fid-umd {"name":"PasswordStrength","jslint":1}
/*global module, exports, define, modulejs, YUI, console */
(function (name, root, factory) {
    "use strict";
    function isObject(x) { return typeof x === "object"; }
    if ((typeof module)[0] === "o" && isObject(module.exports)) {
        module.exports = factory();
    } else if ((typeof exports)[0] === "o") {
        exports[name] = factory();
    } else if (isObject(root.define) && root.define.amd) {
        root.define(name, [], factory);
    } else if (isObject(root.modulejs)) {
        root.modulejs.define(name, factory);
    } else if (isObject(root.YUI)) {
        root.YUI.add(name, function (Y) { Y[name] = factory(); });
    } else {
        root[name] = factory();
    }
}("PasswordStrength", this, function () {
    "use strict";
    // fid-umd end

    /**
     * Shim the Math object to support log2 if it does not already.
     */
    if (!Math.log2) {
        Math.log2 = function (n) {
            return Math.log(n) / Math.log(2);
        };
    }


    /**
     * Iterates over an object
     *
     * @param {Object} obj
     * @param {Function(key,value)} callback
     */
    function objectForEach(obj, callback) {
        Object.keys(obj).forEach(function (key) {
            callback(key, obj[key]);
        });
    }


    /**
     * Turns a list of characters into a regular expression that will match
     * whatever you pass in.  There may be trouble generating the pattern,
     * so here we are escaping every character that isn't alphanumeric.
     *
     * @param {string} letters
     * @param {string} flags (defaults to "")
     * @return {RegExp} pattern
     */
    function safeCharMatcher(letters, flags) {
        return new RegExp("[" + letters.replace(/[\W_]/g, function (x) { return "\\" + x; }) + "]", flags || "");
    }


    /**
     * Determine the strength of a password.
     *
     * Usage:
     *
     *     ps = new PasswordStrength();
     *
     *     // Improve checks by adding additional data files - optional
     *     ps.addCommonPasswords(pass);  // data/common-passwords.json
     *     ps.addTrigraphMap(tri);  // data/trigraphs.json
     *
     *     // Calculate password strength
     *     stats = ps.check("my password");
     *
     * @return {PasswordStrength} instance
     */
    function PasswordStrength() {
        if (!(this instanceof PasswordStrength)) {
            return new PasswordStrength();
        }

        this.commonPasswords = null;
        this.trigraph = null;
        this.charsets = {
            number: "0123456789",
            lower: "abcdefghijklmnopqrstuvwxyz",
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            punctuation: "!'.:;?&-\" ",  // Things found in sentences
            symbol: "@#$%^*(){}[]><~`_+=|/" // Typically math-related
        };


        /**
         * Sets commonPassword property with what a user passes in.
         * Uses it if it's an array, processes it into an array if it's a
         * string and throws an error if it's not a format we can work with.
         *
         * Returns the PasswordCheck object so it can be chained
         *
         * @param {(Array|string)} passwords
         * @return {PasswordStrength} PasswordStrength
         */
        this.addCommonPasswords = function (passwords) {
            if (passwords) {
                if (Array.isArray(passwords)) {
                    this.commonPasswords = passwords;
                } else if (typeof passwords === "string") {
                    this.commonPasswords = passwords.split(/\r\n|\r|\n/);
                } else {
                    throw new Error("Format does not match any expected format.");
                }
            } else {
                this.commonPasswords = [];
            }

            return this;
        };


         /**
         * TrigraphMap is an ojbect representing entries of 3 letter
         * combinations and how often they appear.
         *
         * {
         *     "_ty": 123,
         *     "tyl": 22,
         *     "yle": 19,
         *     "ler": 5,
         *     "er_": 543
         * }
         *
         * For further explanation on the numbers, check out the documentation
         * in the data folder.
         *
         * @typedef {Object} PasswordStrength~trigraphMap
         * @property {number} * Frequencies of that letter combo.
         */

        /**
         * Returns the PasswordStrength object so it can be chained
         *
         * TA:  Again, define Object better.  Make a type for
         * PasswordStrength~trigraphMap.
         *
         * @param {PasswordStrength~trigraphMap} trigraphMap
         * @return {PasswordStrength} PasswordStrength
         */
        this.addTrigraphMap = function (trigraphMap) {
            if (trigraphMap) {
                if (trigraphMap && typeof trigraphMap === "object" && !Array.isArray(trigraphMap)) {
                    this.trigraph = trigraphMap;
                } else {
                    throw new Error("Format does not match any expected format.");
                }
            } else {
                this.trigraph = null;
            }

            return this;
        };


        /**
         * charsetGroups is an object of different group of defined characters
         * used in figuring out how many characters per group as well as
         * what characters fall into each group.  It is based on a
         * PasswordStrength instance's `this.charsets` object.  When a password
         * has a character that matches one of the character sets in the
         * PasswordStrength instance's sets, this sets that key to `true`.
         *
         * The "other" key is all letters that did not match another set.
         *
         * Example for the password "abcd£1234":
         *
         * {
         *     lower: true,
         *     upper: false,
         *     number: true,
         *     punctuation: false,
         *     symbol: false,
         *     other: "£"
         * }
         *
         * @typedef {Object} PasswordStrength~charsetGroups
         * @property {string} other Characters that did not match another set
         * @property {boolean} * All of the rest of the sets just set flags
         */

        /**
         * Gets the character set size of the current password.
         * This breaks up the each character set and tests the password
         * to see which set they belong in.
         *
         * @param {string} passToCheck
         * @return {PasswordStrength~charsetGroups} groups
         */
        this.charsetGroups = function (passToCheck) {
            var groups;

            groups = {};
            objectForEach(this.charsets, function (key, value) {
                groups[key] = safeCharMatcher(value).test(passToCheck);
            });
            groups.other = this.otherChars(passToCheck);

            return groups;
        };


        /**
         * Calculates the size of each flag found for a password,
         * and will get the flags if a password was passed in.
         *
         * @param {PasswordStrength~charsetGroups} groups
         * @return {number} result
         */
        this.charsetSize = function (groups) {
            var size;

            size = 0;

            objectForEach(this.charsets, function (key, value) {
                /*jslint unparam:true*/
                if (groups[key]) {
                    size += value.length;
                }
            });

            if (typeof groups.other === "string") {
                size += groups.other.length;
            }

            return size;
        };

        /**
        * Statistics is and object with information about the current state of
        * the password.
        *
        * @typedef {Object} PasswordStrength~statistics
        * @property {number} charsetSize size of the characters from each
        * group the characters fall into.
        * @property {boolean} commonPassword
        * @property {number} passwordLength the length of the current password
        * @property {number} shannonEntropyBits
        * @property {string} strength how the strong the calculated password is
        * estimated to be
        * @property {(null|number)} trigraphEntropyBits
        */

        /**
         * Calculates a bunch of statistics about a given password.
         *
         * TA:  Define PasswordStrength~statistics
         *
         * @param {string} password
         * @return {PasswordStrength~statistics}
         */
        this.check = function (currentPassword) {
            var result;

            result = {
                charsetSize: 0,
                commonPassword: false,
                passwordLength: 0,
                shannonEntropyBits: 0,
                strengthCode: null,
                trigraphEntropyBits: null,
                charsets: null
            };

            // For undefined and if we get an empty value
            if (!currentPassword || !currentPassword.length) {
                if (this.trigraph) {
                    result.trigraphEntropyBits = 0;
                }

                return result;
            }

            result.commonPassword = this.checkCommonPasswords(currentPassword);
            result.charsets = this.charsetGroups(currentPassword);
            result.charsetSize = this.charsetSize(result.charsets);
            result.shannonEntropyBits = this.shannonScore(currentPassword);
            result.passwordLength = currentPassword.length;
            result.trigraphEntropyBits = this.checkTrigraph(currentPassword, result.charsetSize);
            result.strengthCode = this.determineStrength(result);

            return result;
        };

        /**
         * This checks to see if the password is in the common list of
         * passwords.  If in the common passwords lists, sets the warn flag.
         *
         * @param {string} passToCheck
         * @return {boolean}
         */
        this.checkCommonPasswords = function (passToCheck) {
            var i, commonPasswordsLength, commonPasswordsList;

            passToCheck = passToCheck.toLowerCase();

            if (this.commonPasswords && this.commonPasswords.length) {
                commonPasswordsList = this.commonPasswords;
                commonPasswordsLength = this.commonPasswords.length;

                for (i = 0; i < commonPasswordsLength; i += 1) {
                    if (commonPasswordsList[i] === passToCheck) {
                        return true;
                    }
                }

                return false;
            }

            return null;
        };


        /**
         * Compares the password to the trigraph to get the rating of how
         * guessable the password is.
         *
         * @param {string} passToCheck
         * @param {number} charsetSize
         * @return {number} entropy in bits
         */
        this.checkTrigraph = function (passToCheck, charsetSize) {
            var score, i, str;

            if (!this.trigraph) {
                return null;
            }

            score = 1;
            passToCheck = passToCheck.toLowerCase().replace(/[\W_]/gi, " ").trim();
            passToCheck = "_" + passToCheck + "_";

            for (i = 0; i < passToCheck.length - 2; i += 1) {
                str = passToCheck.substr(i, 3);

                if (this.trigraph[str]) {
                    // Less than fully random
                    score *= (1.0 - (this.trigraph[str] / 10000)) * charsetSize;
                } else {
                    // Fully random selection
                    score *= charsetSize;
                }
            }

            return Math.log2(score);
        };


        /**
         * Takes parameters and calculates the strength of a given password
         * from a list of codes set. This will use the trigraph entropy bits if
         * available and fallback to the shannon entropy bits which we should
         * always have.
         *
         * @param {Object} status
         * @return {string} strengthCode
         */
        this.determineStrength = function (status) {
            var strengthCode, entropyBits;
            strengthCode = "";

            if (!status.trigraphEntropyBits) {
                entropyBits = status.shannonEntropyBits;
            } else {
                entropyBits = status.trigraphEntropyBits;
            }

            if (entropyBits <= 32) {
                strengthCode = "VERY_WEAK"; // Keep out a typical attacker for minutes
            } else if (entropyBits <= 48) {
                strengthCode = "WEAK"; // Crackable by a typical home computer in a week.
            } else if (entropyBits <= 64) {
                strengthCode = "REASONABLE"; // A specialized computer could get this in one year.
            } else if (entropyBits <= 80) {
                strengthCode = "STRONG"; // Resistant to a large, coordinated attack (botnet) for over a year.
            } else {
                // Nearly impossible to brute force, given more than all of the computing power in the world, 
                // optimized algorithms, specialized hardware and a thousand years.
                strengthCode = "VERY_STRONG";
            }

            return strengthCode;
        };


        /**
         * Calls function to see if there are other characters used
         * which we don't explicitly check for.
         *
         * @param {string} passToCheck
         * @return {string} result
         */
        this.otherChars = function (passToCheck) {
            var chars, hash, pattern;

            chars = "";
            objectForEach(this.charsets, function (key, value) {
                /*jslint unparam:true*/
                chars += value;
            });
            pattern = safeCharMatcher(chars, 'g');
            hash = {};
            passToCheck.replace(pattern, '').split('').forEach(function (letter) {
                hash[letter] = true;
            });

            return Object.keys(hash).join('');
        };


        /**
         * Calculate the Shannon Entropy value of a password.  This is really
         * the number of bits necessary to represent the possible characters
         * times the length of the password.
         *
         * Reworked from code under a MIT license.
         * entropy.js MIT License © 2014 James Abney http://github.com/jabney
         *
         * @param {string} pass Password to evaluate
         * @return {number} Bits of entropy
         */
        this.shannonScore = function (pass) {
            var freq, passLength, sum;

            function countFrequencies() {
                var c, h, i;

                h = {};  // Hash for collecting frequencies

                for (i = 0; i < passLength; i += 1) {
                    c = pass.charAt(i);

                    if (!h[c]) {
                        h[c] = 1;
                    } else {
                        h[c] += 1;
                    }
                }

                return h;
            }

            sum = 0;
            passLength = pass.length;
            freq = countFrequencies();
            objectForEach(freq, function (key, value) {
                /*jslint unparam:true*/
                var score;

                score = value / passLength;
                sum -= score * Math.log2(score);
            });

            return sum * passLength;
        };
    }

    return PasswordStrength;
    // fid-umd post
}));
// fid-umd post-end
