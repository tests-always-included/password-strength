Entropy Score Seems Wrong
=========================

When creating a password, your goal is to make it very difficult to guess or hack.  Sometimes you think your password is super secure because it is long.  Other times the password was randomly generated.  Maybe you are here because the entropy value seemed too high when you typed in "aaaaaaaa" or you were wondering why that's not the same entropy as "zzzzzzzz".

Regardless the reason, let's dive a little into the math surrounding the entropy scores.


Calculation of Entropy
----------------------

Researchers can spend their entire lives devising schemes to measure the amount of entropy in a given data set.  In essence, one only measures how much entropy there *isn't* instead of how much there *is*.


### Entropy Basics

For our examples, we will use 8 character long passwords and primarily restrict ourselves to the 26 lowercase letters in the English language.

Assuming that you roll dice or have another truly random method for picking letters, you will generate one of a possible 208,827,064,576 passwords.  That number is generated because you have 26 different letters you can pick for each of the 8 letters in the password.  The math to compute the number of permutations would be 26^8, or 208 billion.

This includes passwords like "thimbles" and "stupider", but more on that weakness later.

To compute the number of bits of entropy, one just tries to figure out how many possibilities there are (208 billion) and then figures out how big of a binary number it would take to represent it.  To do that you use `log(26^8) / log(2)` because normally the `log()` function provides results in base 10 and we require them in base 2.  This is also known as `log2(26^8)`, and the result is about 37.6 bits of entropy.


### Character Set Sizes

This math is possible because we know how many letters are in our alphabet.  To include uppercase letters and lowercase letters the set grows to `26 + 26 = 52` options for each letter in the password.  If we were dealing with an unknown language or if we didn't want to group the letters into sets of characters then we would have a harder time.

There are a couple options that the password strength software has taken to combat this problem.  The first is using a technique from Claude Shannon, where the letters in the password itself are used as the character set size.  Using the password of "aaaabbbb" would indicate there's only 2 options per character and we'd have `2^8` possibilities.  This works way better for longer passwords that have more varied characters.

The other technique is to lump letters together into groups.  When a letter is encountered from a group, the entire group's size is included.  A lot of systems require you to use "one capital letter, one number, one symbol" and our character sets are similar.  So the password of "aA0!aA0!" would score poorly with Shannon's technique (`4^8` possibilities) but much better when using the groups of letters (`26 + 26 + 10 + 10 = 72` options for each character, `72^8` possibilities).


### Character Prediction

When checking passwords, one should be encouraged (though not required) to use randomly generated passwords that do not look like words.  If you typically use words, those passwords should be weaker.  To accomplish this, a large amount of text was analyzed for letter trigraphs, which is essentially saying, "When given two letters, what's the chance you can predict the third letter?"

Let's take a look at the sample password "thimbles".  If we analyze the first two letters, we can predict what the next letter will be.  There's about a 67% chance that "e" will follow "th".  There's about a 10% chance it could be an "a" and 9% chance a word ends with "th".  Our letter is "i", and there's only about a 6.5% chance that "thi" will be the outcome.  So, 93.5% of the time we will be wrong.

Our entropy calculations would say that the maximum score for the third letter would be 26, but we only keep 93.5% of that value, resulting in a lower overall entropy score.


Hacking Techniques
------------------

Really, the password strength meter does not measure the technique used to generate a password.  It only measures the password and what it would take for the password to be compromised.  Explained another way: your password generator may have a truly random technique of making your password but that doesn't help if it generates "abcd1234".


### Common Passwords

People collect lists of passwords that have been successful on other sites.  This will be the first attack performed whenever someone is trying to hack or crack passwords.

Do not reuse passwords.  Use a password manager that was reviewed for security holes and generate unique, long, random passwords everywhere.


### Wordlists

After the handful of seconds it takes to try a million common passwords, the very next attack is typically against wordlists.  People collect words, slang and misspellings from all of the languages, then they feed these wordlists into their password crackers.

Do not use a single word from a wordlist.  Use a password manager that was reviewed for security holes and generate unique, long, random passwords everywhere.


### Mutation Engines

Processing wordlists takes some time, but not a very long amount of time.  Hackers will still be quite interested in cracking passwords even after they run out of words.  One of the techniques that may be employed is to use a mutation engine on the wordlist in order to generate more passwords to check.  The mutation engine would change capitalization, add numbers to the beginning or the end, add symbols and possibly even concatenate words.

This increases the invested time dramatically, but also yields good results.  How many times have you thought about using a password with a year or other number after it?

It is also an option to pass entries through filters that apply other alterations.  You can pluralize words or conjugate verbs differently.  It can be translated ROT13, pig latin or leetspeak.


### Algorithm-specific Attacks

A bit of knowledge goes a long way.  Once I worked for a company that required passwords that were exactly 8 characters.  You must have at least one capital letter, one lowercase letter, one number and one symbol.  At first blush you may think that you have a possible 95 characters for each position and we need a total of 8 characters, so 95^8 possibilities (6.6E15).

Remember, "a bit of knowledge goes a long way," from earlier?  Some more information you've obtained is that the list of symbols that are allowed is either `.` or `$`.  Only those two are permitted.  Not even spaces are allowed.  So your character set size drops to 64, and the total is 64^8 (2.8E14).  We've reduced the total number of passwords down to about a 1/23 of what it was previously.

We can reduce this vast number of passwords further.  The real number of allowed passwords is significantly smaller because not all of these will have an uppercase, lowercase, or a number.  In fact, approximately 85% of the passwords are invalid.  That brings our number down to 4.2E13.  Still a hefty number, certainly, but on the verge of possibility.  A person who has access to a hefty number of computers, such as a college computer lab, could load distributed password hashing clients and brute-force the entire keyspace.

To exemplify the idea of algorithm-specific attacks, let's take a look at the older Visual Basic's random number routine.  It just used a very simple algorithm and provided a random digit in a known series.  You can seed it with a fixed number and always get the same resulting series of numbers.  If you seed it with something arbitrary, such as the date, then you simply start in a randomish location in your fixed list of "random numbers."  Let's pretend that I used that random number generator to make passwords and my tool gets to be somewhat popular so 0.5% of the people on the internet use it to generate passwords.  Their password entropy is almost zero even though the password looks random.  Assuming you can guess the length of the password, there's only 2^24 possibilities for starting positions, so there's a maximum of 24 bits of entropy plus a bit for the password length.

Now, let's add a twist.  Assume I score those passwords poorly (as I should) and your significantly better tool makes a password that happens to be one that the terrible random number generator would produce.  Your password could be guessed.  No matter how good your source, it is the result that matters.


Alternative Views
-----------------

Using passwords is starting to become a very intense debate.  Should people use passwords or passphrases?  Should both be eliminated and one time keys or truly randomly generated data be used instead?  Should the password be one that can be conveyed over a telephone?  Should it be so complex that it must be written down instead of remembered?  Does a password management tool add too much complexity for day-to-day operations?

All of these questions are ones that help select a valid password policy for your use case.  Each of them has valid points on both sides of the argument.  We are trying to sidestep the debate by providing a tool that aims to see how likely a user's password will be broken and gauges its strength on a few different algorithms.

Even the algorithms that are used here are open to debate.  For instance, using the password "aaaaaaaa" is extremely unlikely and this mechanism gives it a fairly tolerable rating.  People may argue that it only uses one character and so it is very insecure.  However, if I said you had to find the password, you would start with trying word-based passwords that relate to the user.  Even hacking tools may not list "aaaaaaaa" in their wordlist because it isn't a valid word.  To that end, it's about as likely as any other combination of 8 lowercase letters.

The password strength tester avoids some of the debate by focusing entirely on what an arbitrary hacker will have available:

* It doesn't have any inside information, which would potentially weaken or strengthen the passwords your users employ.
* It uses a language-specific set of letter frequencies.  If you are managing different languages, these letter pairs will not properly represent your language.
* There is no compensation for existing attacks beyond the commonly used password list.  For instance, your password could have numbers appended.  This does not weaken the result when there's a password breaking tool that can allow automatically for the numbers at the end.
* We prefer to not use the Shannon entropy score, which would rank "aaaaaaaa" as having zero entropy.  Instead, we try to take the approach of how difficult the password would be to find from a hacker's point of view.
* The scoring method works better when passphrases are used because it is significantly easier to find "2legit2quit" than "Smiles is the longest word; there's a mile between the s's."

This tool does try to focus on the attacker's side.  Passwords that are easier to guess will get lower scores.  It does not matter how you generated a password.  What really matters is how easy it is for hackers to find the password.  For instance, let's assume your randomly generated password made the word "pictures".  That's an option when you use only lowercase and it's only got a 1 out of 26^8 chance of showing up, but it *can* show up.  If your random password generator happened to make something that was a word or word-like then it would be easier to crack.  The software's scores are only estimates for how much work needs to be invested to obtain the password.  You would not accept this because it looks like a word.  Regenerating a password (again, assuming 8 lowercase letters) you come up with "annhqann" and assume that's good.  Admittedly, it's unlikely that a "q" is followed by "a", so you use it.

Let's now attempt to crack your password.  When cracking a lot, I start with a known password list and move on to wordlists.  I'd get plenty and probably stop there.  However, if I really wanted to get specific password, I would start using password mutation routines on the dictionary entries.  Mutation routines such as taking two arbitrary words and concatenating them together, adding numbers at the end, introducing misspellings, etc.  After that I would use a weighted brute force algorithm that would eventually generate all possibilities but would try them in a preferential order.  This would find passwords based on other languages and ones that happened to look close enough to other languages.  Eventually I would get to the truly random passwords where the letter frequency charts don't cover the possibilities.

With that system in place, nearly all passwords would be found and most would be found quickly.  Every bit of password that I can guess (say, some three letters in a row in an otherwise random password) decreases your strength.  It makes it easier for me to guess.  When I can guess trillions of passwords per second, how long will your password survive?
