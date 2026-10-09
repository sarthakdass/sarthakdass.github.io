---
title: Problem-Solving Seminar Problem Set 1
date: 2025-09-29
tags: Math
---

Every week, my Problem Solving Seminar class will give a handout of 5 problems over the week to solve due on the following Monday, of which I don't really have a specific goal other than to solve as many as I can when I have the time. Usually, these are all going to be far less readable than my usual problems since I will mostly give sketches unless I have more time to provide full solutions.

These are going to look so ugly on here compared to an AoPS blog, which is where I should have probably documented these.

## Problems

### Problem 1

Find positive integers $n$ and $a_1, a_2, \ldots, a_n$ such that

$$a_1 + a_2 + \cdots + a_n = 2025$$

and the product

$$a_1 a_2 \ldots a_{2025}$$

is as large as possible.

### Problem 2

Find all integers $n$ satisfying $n \ge 2$ and

$$\frac{\sigma(n)}{f(n)-1} = n$$

in which $\sigma(n)$ denotes the sum of all positive divisors of $n$, and $f(n)$ denotes the largest prime divisor of $n$.

### Problem 3

Let $n \in \N$. Prove that

$$\sum_{k=0}^n \binom{2n+1}{2k+1} 8^k$$

is not divisible by 5.

### Problem 4

Let $f : \N \to \N$ be defined as follows: for each positive integer $n$, let $f(n)$ be the sum of the digits of $n$. Find

$$f(f(f(2025^{2025})))$$

### Problem 5

A sequence

$$\{x_n\}_{n \ge 0}$$

is defined by $x_0 = 2$, $x_1 = 5/2$, and for each $n \ge 1$,

$$x_{n+1} = x_n(x_{n-1}^2 - 2) - x_1$$

Prove that for each $n \in \N$, we have

$$\lfloor x_n \rfloor = 2^{\frac{2^n - 2(-1)^n}{3}}$$

## Solutions

### Solution 1

This is a fairly straightforward problem I remember coming up with and solving in middle school, so it was amusing to see it on this problem set.

We can't include any numbers that are 5 or greater. For $k \ge 5$, we could always split that number up into at least two numbers by taking out a 2 since $2(k-2) > k$.

We can't have any 1's since for any number $k$, we would rather just have the number $k$ than 1 and $k-1$, which strictly has a smaller product.

It could include a 4, but we could also just equivalently split that up as two 2's for aesthetics.

So, we know we can only have 2's and 3's. We conclude we must have more 3's than 2's since 6 can be broken down into two 3's or three 2's, of which the former has the larger product.

Essentially, we maximize the number of 3's we can have, being slightly careful with the 1 mod 3 case.

For a number of the form $3k$, our maximum product is $3^k$

For a number of the form $3k+1$, our maximum product is $3^{k-1} \cdot 2^2$, rather than $3^k \cdot 1$

For a number of the form $3k+2$, our maximum product is $3^k \cdot 2$

Answer:

$$n = 675, a_1 = a_2 = \cdots = a_{675} = 3$$

### Solution 2

First motivation is to rearrange the equation, as now the LHS is multiplicative

$$\frac{\sigma(n)}{n} = f(n) - 1$$

We also want to rewrite $n$ in its prime factorization

$$n = p_1^{e_1} \ldots p_k^{e_k}$$

where

$$p_1 < \cdots < p_k = f(n)$$

Rewriting our new equation:

\begin{align}
f(n) - 1 = \frac{\sigma(n)}{n} &= \frac{\prod_{i=1}^k (1 + p_i + \cdots + p_i^{e_1})}{\prod_{i=1}^k p_i^{e_i}} \\
&= \prod_{i=1}^k \left(1 + \frac{1}{p_i} + \cdots + \frac{1}{p_i^{e_i}}\right) \\
&< \prod_{i=1}^k \left(1 + \frac{1}{p_i} + \frac{1}{p_i^2} + \ldots\right) \\
&= \prod_{i=1}^k \frac{1}{1 - \frac{1}{p_i}} = \prod_{i=1}^k \frac{p_i}{p_i - 1}
\end{align}

Now we are left with

$$f(n) - 1 < \prod_{i=1}^k \frac{p_i}{p_i - 1}$$

We claim $f(n) = p_k \ge 5$ makes the RHS less than the LHS by induction

Base case: the RHS is at most $5/4 \cdot 3/2 \cdot 2 = 15/4$, less than LHS of 4

Inductive step: say we have a greater prime factor $p_{k+1}$

The LHS increases by a factor of

$$\frac{p_{k+1} - 1}{p_k - 1}$$

The RHS increases by a factor of

$$\frac{p_{k+1}}{p_{k+1} - 1}$$

The LHS growth factor is "clearly" larger (RHS difference between denominator and numerator is only 1, whereas LHS difference is at least 2, also RHS denominator is larger than the LHS denominator), proving our claim.

Thus, by showing we cannot have any prime factors of 5 or greater, our number $n$ is of the form $2^a 3^b$.

We can quickly show the case $b = 0$, meaning $n = 2^a$ and $f(n) = 2$, is impossible by the following:

\begin{align}
\sigma(2^a) &= 1 + 2 + \cdots + 2^a = 2^{a+1} - 1 \\[1ex]
\frac{\sigma(n)}{f(n) - 1} &= n \\[1ex]
2^{a+1} - 1 &= 2^a \\
2^a &= 1
\end{align}

This last equality is only true for $a = 0$ or $n = 1$, which is not only nonsensical as $f(n)$ in this case would not be 2 but also $n = 1$ is outside of the problem's constraints, and thereby not a possibility.

Now we work with $n = 2^a 3^b$ with positive $b$, so $f(n) = 3$

\begin{align}
\sigma(2^a 3^b) &= (1 + 2 + \cdots + 2^a)(1 + 3 + \cdots + 3^b) = (2^{a+1} - 1)\left(\frac{3^{b+1} - 1}{2}\right) \\[1ex]
\frac{\sigma(n)}{f(n) - 1} &= n \\[1ex]
\frac{(2^{a+1} - 1)\left(\frac{3^{b+1} - 1}{2}\right)}{2} &= 2^a 3^b \\[1ex]
(2^{a+1} - 1)(3^{b+1} - 1) &= 2^{a+2} 3^b
\end{align}

The first term of the LHS is clearly not divisible by 2 and the second term of the LHS is clearly not divisible by 3. Thus, we can set up the following system which yields:

\begin{align}
2^{a+1} - 1 &= 3^b \\
3^{b+1} - 1 &= 2^{a+2} \\[1ex]
2^{a+1} - 1 &= 3^b \\
3 \cdot (2^{a+1} - 1) - 1 &= 2^{a+2} \\[1ex]
3 \cdot 2^{a+1} - 4 &= 2 \cdot 2^{a+1} \\
2^{a+1} &= 4 \\
a &= 1 \\[1ex]
4 - 1 &= 3^b \\
b &= 1
\end{align}

Therefore, our only possibility is $a = 1$, $b = 1$, $n = 6$, which indeed works if we plug it in.

Answer: $n = 6$

### Solution 3

We wish to express our sum in a non-combinatorial manner via linear recurrence.

To do so, we will need this representation, motivated by our combinatorial term, with the long-term vision of using the Binomial Theorem to derive a closed form.

$$8^k = \frac{1}{\sqrt{8}} (\sqrt{8})^{2k+1}$$

We can leverage this to give us a slick difference of two binomial expansions so that only the odd-power terms remain.

\begin{align}
\binom{2n+1}{2k+1} 8^k &= \frac{1}{\sqrt{8}} \sum_{k=0}^n \binom{2n+1}{2k+1} (\sqrt{8})^{2k+1} \\
&= \frac{1}{\sqrt{8}} \sum_{m=0}^{2n+1} \binom{2n+1}{m} (\sqrt{8})^m \left(\frac{1 - (-1)^m}{2}\right) \qquad \text{(indicator of odd } m\text{)} \\
&= \frac{1}{2\sqrt{8}} \sum_{m=0}^{2n+1} \binom{2n+1}{m} (\sqrt{8})^m - \frac{1}{2\sqrt{8}} \sum_{m=0}^{2n+1} \binom{2n+1}{m} (\sqrt{8})^m (-1)^m \\
&= \frac{1}{2\sqrt{8}} \sum_{m=0}^{2n+1} \binom{2n+1}{m} (\sqrt{8})^m - \frac{1}{2\sqrt{8}} \sum_{m=0}^{2n+1} \binom{2n+1}{m} (-\sqrt{8})^m \\
&= \frac{1}{2\sqrt{8}} \left((1 + \sqrt{8})^{2n+1} - (1 - \sqrt{8})^{2n+1}\right) \qquad (1)
\end{align}

$1+\sqrt{8}$ and $1-\sqrt{8}$ are roots of the characteristic polynomial $x^2 - 2x - 7$, which gives us the recursion formula for our sequence:

$$a_n = 2a_{n-1} + 7a_{n-2} \qquad (2)$$

The odd-indexed terms of this sequence are given by (1). Directly computing from the explicit formula (using $n$ instead of $2n+1$ as the exponent), we have $a_0 = 0$ and $a_1 = 1$.

We can now compute all the values of $a_n$ modulo 5 by using (2), which has period 24, so we compute until we get back 0 and 1 consecutively.

$$\{a_n\} := 0, 1, 2, 1, 1, 4, 0, 3, 1, 3, 3, 2, 0, 4, 3, 4, 4, 1, 0, 2, 4, 2, 2, 3, 0, 1, \ldots$$

Caring only about the odd-indexed terms, we have

$$\{a_{2n+1}\} := 1, 1, 4, 3, 3, 2, 4, 4, 1, 2, 2, 3, \ldots$$

with period 12, and none are equivalent to 0 modulo 5, thus proved.

### Solution 4

This one's a little more boring and straightforward, but my methods are laughably egregious. We primarily use two facts:

(1) Sum of the digits of a number preserves residue modulo 9.

(2) A number $n$ has $\log(n) + 1$ digits.

$2025^{2025} \equiv 0 \pmod 9$.

$2025^{2025}$ has $\log(2025^{2025}) + 1 = 2025 \cdot \log(2025) + 1$ digits.

We will now make engineers proud with the following calculation.

$$\log(2025) = \log(1000 \cdot 2.025) = 3 + \log(2.025) \approx 3 + 0.5 \approx 3.5$$

We can say $2025^{2025}$ has at most $2025 \cdot 3.5 + 1 = 7089$ digits.

$$f(2025^{2025}) \le 9 \cdot 7089 = 63801$$

Thus, $f(2025^{2025})$ is a multiple of 9 that is at most 63801.

$f(f(2025^{2025}))$ is at most a multiple of 9 with digit sum 9, 18, 27, or 36 (since 63801 has 5 digits and is less than 99999). All of these potential digit sums have digit sum 9. Hence, we can disgustingly conclude $f(f(f(2025^{2025}))) = 9$.

Answer: 9

### Solution 5

Was unable to solve; will solve later.
