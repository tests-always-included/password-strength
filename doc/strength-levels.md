Estimation of Strength Levels
=============================

The password strength library calculates the relative strength of a password for you and assigns it a code.  This code comes from crunching some hard numbers and thresholds for how resistant passwords need to be for various situations.

For our calculations, we are using approximate MD5 cracking speed because of its prevalence on the web.  Not all hashing methods are equal.  Some can be executed on a GPU (increasing cracking speed dramatically) and some have flaws that allow collision attacks.  MD5 seems to be a good balance between the difficult ones and the faster hashes.

A typical home computer, at the time of this writing, can pump out 2.5E+8 (250 million) MD5 hashes without really trying too hard as long as you use a GPU accelerated algorithm.  A specialized computer recently made news and is able to pump out 1.8E+11 (180 billion) hashes per second.  We also overestimated the size of a botnet, saying it could contain up to 500 million typical computers.  There's only 1.1 billion computers in the world, so this means almost 1/2 of them are participating in cracking your password.  Then we also estimate the computing power of Skynet as equivalent to 8 botnets.  Who really knows what optimizations artificial intelligences will bring to the hacker world?

To get the strength levels, we define them as follows:

* Very weak = Keep out a typical attacker for minutes.
* Weak = Crackable by a typical home computer in a week.
* Reasonable = A specialized computer could get this in one year.
* Strong = Resistant to a large, coordinated attack (botnet) for over a year.
* Very strong = Nearly impossible to brute force, given more than all of the computing power in the world, optimized algorithms, specialized hardware and a thousand years.

There is a spreadsheet that shows the calculations.  Strangely, this nearly lines up to an extra 16 bits of entropy to go up each level.

* Very weak = 32 bits
* Weak = 48 bits
* Reasonable = 64 bits
* Strong = 80
* Very strong = 96
