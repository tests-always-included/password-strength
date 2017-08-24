"use strict";

var PasswordStrength, passwordStrength;


beforeEach(function () {
    PasswordStrength = require("../../").PasswordStrength;
    passwordStrength = new PasswordStrength();
});

describe("addCommonPasswords()", function () {
    it("adds data as JSON then passes nothing to reset", function () {
        passwordStrength.addCommonPasswords([
            "abc123",
            "123456"
        ]);

        expect(passwordStrength.commonPasswords).toEqual([
            "abc123",
            "123456"
        ]);

        passwordStrength.addCommonPasswords();

        expect(passwordStrength.commonPasswords).toEqual([]);
    });

    it("adds data as a string", function () {
        passwordStrength.addCommonPasswords("abc123\n123456");

        expect(passwordStrength.commonPasswords).toEqual([
            "abc123",
            "123456"
        ]);
    });

    it("tries to add another type of format", function () {
        // Need to wrap the method in a function call so we can catch the error
        expect(function () {
            passwordStrength.addCommonPasswords({
                abc123: true,
                123456: false
            });
        }).toThrow();
    });
});


describe("addTrigraphMap()", function () {
    it("passes a proper trigraph set and then a blank one", function () {
        passwordStrength.addTrigraphMap({
            _qu: 9468,
            quo: 267,
            uot: 2820,
            te_: 1678
        });

        expect(passwordStrength.trigraph).toEqual({
            _qu: 9468,
            quo: 267,
            uot: 2820,
            te_: 1678
        });

        passwordStrength.addTrigraphMap();
        expect(passwordStrength.trigraph).toEqual(null);
    });

    it("tries to add an array", function () {
        // Need to wrap the method in a function call so we can catch the error
        expect(function () {
            passwordStrength.addTrigraphMap(["_qu", "quo"]);
        }).toThrow();
    });
});

describe("charsetSize()", function () {
    it("determines size with lowercase and uppercase", function () {
        expect(passwordStrength.charsetSize({
            lower: true,
            upper: true,
            number: false,
            punctuation: false,
            symbol: false
        })).toBe(52);
    });

    it("determines size with numeric, punctuation and symbols", function () {
        expect(passwordStrength.charsetSize({
            lower: false,
            upper: false,
            number: true,
            punctuation: true,
            symbol: true
        })).toBe(42);
    });
});

describe("charsetGroups()", function () {
    it("talllies uppercase and numbers", function () {
        expect(passwordStrength.charsetGroups("00DEADBEEF00")).toEqual({
            number: true,
            lower: false,
            upper: true,
            punctuation: false,
            symbol: false,
            other: ""
        });
    });
    it("detects lowercase, punctuation and symbols", function () {
        expect(passwordStrength.charsetGroups("p@sswo.rd")).toEqual({
            number: false,
            lower: true,
            upper: false,
            punctuation: true,
            symbol: true,
            other: ""
        });
    });
    it("supports Unicode characters", function () {
        var airplane, star;

        airplane = String.fromCharCode(9992);
        star = String.fromCharCode(9728);
        expect(passwordStrength.charsetGroups(star + "fdfdfd" + airplane)).toEqual({
            number: false,
            lower: true,
            upper: false,
            punctuation: false,
            symbol: false,
            other: star + airplane
        });
    });
    it("deduplicates Unicode characters", function () {
        var airplane, star;

        airplane = String.fromCharCode(9992);
        star = String.fromCharCode(9728);
        expect(passwordStrength.charsetGroups(star + star + airplane + star + airplane)).toEqual({
            number: false,
            lower: false,
            upper: false,
            punctuation: false,
            symbol: false,
            other: star + airplane
        });
    });
});

describe("check()", function () {
    beforeEach(function () {
        passwordStrength.addCommonPasswords([
            "abc123",
            "abcd1234",
            "quote"
        ]).addTrigraphMap({
            _qu: 9468,
            quo: 267,
            uot: 2820,
            te_: 1678
        });
    });

    it("returns all calculated status properties for quote", function () {
        expect(passwordStrength.check("quote")).toEqual({
            charsetSize: 26,
            commonPassword: true,
            nistEntropyBits: 12,
            passwordLength: 5,
            shannonEntropyBits: 11.60964047443681,
            strengthCode: "VERY_WEAK",
            trigraphEntropyBits: 18.487783049487163,
            charsets: {
                number: false,
                lower: true,
                upper: false,
                punctuation: false,
                symbol: false,
                other: ""
            }
        });
    });

    it("returns all calculated status properties for Quot", function () {
        expect(passwordStrength.check("Quot")).toEqual({
            charsetSize: 52,
            commonPassword: false,
            nistEntropyBits: 10,
            passwordLength: 4,
            shannonEntropyBits: 8,
            strengthCode: "VERY_WEAK",
            trigraphEntropyBits: 18.05234113785076,
            charsets: {
                number: false,
                lower: true,
                upper: true,
                punctuation: false,
                symbol: false,
                other: ""
            }
        });
    });
});

describe("checkCommonPasswords()", function () {
    describe("with some common passwords", function () {
        beforeEach(function () {
            passwordStrength.addCommonPasswords([
                "abc123",
                "!helpme"
            ]);
        });
        it("detects a password in the list", function () {
            expect(passwordStrength.checkCommonPasswords("abc123")).toBe(true);
        });
        it("with a password not on the list", function () {
            expect(passwordStrength.checkCommonPasswords("abc1234")).toBe(false);
        });
    });
    describe("without any common passwords", function () {
        it("always returns null", function () {
            expect(passwordStrength.checkCommonPasswords("abc1234")).toBe(null);
        });
    });
});

describe("checkTrigraph()", function () {
    describe("with a trigraph map", function () {
        beforeEach(function () {
            passwordStrength.addTrigraphMap({
                __q: 22,
                _qu: 9468,
                quo: 267,
                uot: 2820,
                ote: 1095,
                te_: 1678
            });
        });
        it("calculates the strength of a password that's fully defined", function () {
            expect(passwordStrength.checkTrigraph("quote", 26)).toBeCloseTo(18.320470565926694);
        });
        it("can work when portions are not in the frequency table", function () {
            expect(passwordStrength.checkTrigraph("quahe", 53)).toBeCloseTo(24.407172328767736);
        });
        it("does not require any matches in the frequency table", function () {
            // Result should be equal to the length * chaset size.
            expect(passwordStrength.checkTrigraph("blAh", 71)).toBeCloseTo(24.59898847801873);
        });
    });
    describe("without a trigraph map", function () {
        it("returns null", function () {
            expect(passwordStrength.checkTrigraph("quote", 26)).toBe(null);
        });
    });
});


describe("determineStrength()", function () {
    it("returns VERY_WEAK from trigraphEntropyBits", function () {
        expect(passwordStrength.determineStrength({
            trigraphEntropyBits: 31
        })).toBe("VERY_WEAK");
    });

    it("returns WEAK from trigraphEntropyBits", function () {
        expect(passwordStrength.determineStrength({
            trigraphEntropyBits: 36
        })).toBe("WEAK");
    });

    it("returns REASONABLE from trigraphEntropyBits", function () {
        expect(passwordStrength.determineStrength({
            trigraphEntropyBits: 53
        })).toBe("REASONABLE");
    });

    it("returns STRONG from shannonEntropyBits", function () {
        expect(passwordStrength.determineStrength({
            trigraphEntropyBits: null,
            shannonEntropyBits: 72
        })).toBe("STRONG");
    });

    it("returns VERY_STRONG from shannonEntropyBits", function () {
        expect(passwordStrength.determineStrength({
            trigraphEntropyBits: null,
            shannonEntropyBits: 95
        })).toBe("VERY_STRONG");
    });
});


describe("nistScore()", function () {
    it("scores an empty string", function () {
        expect(passwordStrength.nistScore("")).toBe(0);
    });
    it("scores a single character", function () {
        expect(passwordStrength.nistScore(".")).toBe(4);
    });
    it("scores a second character", function () {
        expect(passwordStrength.nistScore(".!")).toBe(6);
    });
    it("applies a bonus", function () {
        expect(passwordStrength.nistScore(".A")).toBe(12);
    });
    it("scores a ninth character", function () {
        expect(passwordStrength.nistScore("123456789")).toBe(19.5);
    });
    it("scores a long passphrase", function () {
        expect(passwordStrength.nistScore("123456789012345678901")).toBe(37);
    });
});


describe("otherChars()", function () {
    it("returns empty string when all allphanumeric", function () {
        expect(passwordStrength.otherChars("Mary1")).toBe("");
    });
    it("returns Unicode and other unhandled charcters, such as spaces", function () {
        var airplane, star;

        // ✈
        airplane = String.fromCharCode(9992);

        // ☀
        star = String.fromCharCode(9728);

        expect(passwordStrength.otherChars("A " + star + " on an " + airplane)).toBe(star + airplane);
    });
});


describe("shannonScore()", function () {
    it("finds a single character's entropy", function () {
        // 0 bits to represent * length of 1 = 0
        expect(passwordStrength.shannonScore("x")).toBeCloseTo(0);
    });
    it("finds two character's entropy", function () {
        // 1 bit to represent * length of 2 = 2
        expect(passwordStrength.shannonScore("xy")).toBeCloseTo(2);
    });
    it("computes entropy correctly", function () {
        expect(passwordStrength.shannonScore("1223334444")).toBeCloseTo(18.464393446710154);
        expect(passwordStrength.shannonScore("AAAAABBCDE")).toBeCloseTo(19.609640474436812);
    });
});
