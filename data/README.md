Data Files
==========

These are optional files that you may add to the password strength instance in order to more accurately estimate a password's strength.


`common-passwords.txt`
----------------------

One should never use a password in this list.  It is a collection of passwords that are often used by people and ones that are frequently tested by automated attacks.

* Adobe's Top 100 passwords
* Multiple "common passwords" lists
* MySpace leaked passwords
* Openwall's common Unix passwords
* SSH dictionary attacks
* Honeypots that log password attempts

These lists have been converted to lowercase, sorted, and deduplicated.


`common-passwords.json`
-----------------------

This is just the text file that was converted to an array through `jq`.

```
jq -R -s -c 'split("\n")' < common-passwords.txt > common-passwords.json
```


`trigraphs.json`
----------------

These are the frequencies of letters that appear in words from Google Books' N-Gram corpus.  We used the 1-gram file, filtering out entries to be between 1990 and 2010.  The words had the tag (eg. `_NOUN` at the end) removed, then counters were incremented by the number of times the word occurred for that year.  To run through an example, there would be a line like this:

```
Gaabucayan_NOUN 1999    9       2
```

In this case we would use the word "Gaabucayan" and convert it to lowercase, then build a letter trigraph frequency table, like so:

* Increment `_ga` ("g" starts the word and is followed by "a") by 9
* Increment `gaa` by 9
* Increment `aab` by 9
* Increment `abu` by 9
* ... and so on
* Increment `yan` by 9
* Increment `an_` by 9 (indicating the end of the word)

Only the numbers 0-9 and letters a-z (all forced to lowercase) have been counted.  Every other character is considered an "end of character".

In the JSON file you will see entries like this:

    "_qu": 9468,
    "quo": 267,
    "uot": 2820,
    "ote": 1095,
    "te_": 1678,

These key/value pairs represent the likelihood that the third character appears after the first two.  Remember, underscores mean "no character", such as at the beginning of the word or the end.  Also, the number at the end is the chance the third letter appears.  Normally that's a value from 0 to 1, but we've multiplied it by 10,000 and kept just the integer portion in order to make the JSON file much smaller.

Let's run through the word "quote".  The odds that a random English word starts with a "q" is about 22/10000 or 0.0022 (or 0.22%).  Pretty unlikely, given that there is a 0.1119 chance the word starts with an "a" or 0.1467 it starts with a "t".  You can use this chance to calculate the odds that a password would be susceptible to a dictionary attack with random mutations.  This particular one-letter score is not calculated quite yet with our algorithm, but the numbers are fun to analyze.

Continuing the example, you look up the chance of "qu" starting a word and find 0.9468.  That means only 5.32% there is something other than a "u" after a "q" that starts a word.  Very powerful.  If you use words starting with a "q" in your passphrase, try to avoid "u" as the second letter!

Next you look up "quo" and get 0.0267, "uot" has 0.282, "ote" gets 0.1095 and finally "te" at the end of the word to get 0.1678.

What you do with these odds is up to you.  The algorithm inside will figure out the chance that it could guess your letter (chance), then give you a worse weight when it's more likely that your password would get guessed (1 - chance).  Finally, the charset size is deduced, depending on what you have entered for a password and we get to know the approximate score ((1 - chance) * charset).  Finally, with the score we determine how many bits it takes to represent it (log2(score)) and we have the number of bits of entropy your password simulates.  We can't measure it exactly, but this is a reasonably close guess.
