Password Strength
==========

[![Build Status](https://travis-ci.org/tests-always-included/password-strength.svg?branch=master)](https://travis-ci.org/tests-always-included/password-strength)

Password Strength is a tool to input a password and have it calculate how strong your password is. This uses several ideas to accomplish this. Primarily this relies on trigraphs which check each set of 3 characters in a given password. This is explained in the data folder's [readme](/data/README.md).  This also calculates the entropy bits based on Claude Shannon's technique on determining the entropy of a particular character appearing after another one. We also check if a password is in a list of common password allowing the user to be warned they should not be using that password.