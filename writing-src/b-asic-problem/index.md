---
title: b-asic problem?
date: 2025-09-22
tags: Math
---

Helped one of my middle-school students with this problem over Discord today morning. This problem was not particularly difficult, but I do think this is a problem which a proficient high school student has all the tools to solve.

## Problem

A positive integer is *b*-asically increasing if its base $b$ representation is strictly increasing digits. For example, 168 and 8 are 10-asically increasing, but 889, 81, 80 are not.

What is the median 18-asically increasing positive integer in base 18?

## Solution

<details class="spoiler" markdown="1"><summary>Show solution</summary>

We first count the total number of 18-asically increasing integers in base 18.

Note that we can never use the digit 0 as we only want positive integers, and we cannot start with a leading 0 even if it technically makes the number have strictly increasing digits. Therefore, we are always working with 17 digits in base 18 (1-17).

We can do casework by valid $n$-digit numbers.

For 1-digit numbers, we have 17 potential options, of which we may choose any of them — $\binom{17}{1}$

For 2-digit numbers, we again have 17 potential options, of which to choose 2, and here order *does* matter! Therefore, instead of just $17 \cdot 16$ options, we have $17 \cdot 16/2$ options as picking 2 and 9 or 9 and 2 as the digits will only allow for the same valid 18-asically increasing number of 29. — $\binom{17}{2}$

By this logic, every $n$-digit number up to 17 has $\binom{17}{n}$ options and we have a total of $\binom{17}{1} + \binom{17}{2} + \dots + \binom{17}{17}$ 18-asically increasing numbers.

> **Binomial Theorem**
>
> $$\sum_{k=0}^{n} \binom{n}{k} = 2^n$$

We pretty much have this summation except for the $k=0$ case, so we know that our sum of $\binom{17}{1} + \binom{17}{2} + \dots + \binom{17}{17} = 2^{17} - 1$ 18-asically increasing numbers. The median here would be the $2^{16}$-th number.

Since combinations are symmetric in the sense that $\binom{n}{k} = \binom{n}{n-k}$, we have

$$\sum_{k=0}^{8} \binom{17}{k} = \sum_{k=9}^{17} \binom{17}{k} = \frac{1}{2} 2^{17} = 2^{16}$$

Once again remembering that we do not account for the $k=0$ case in our problem, we can see that the first $2^{16} - 1$ numbers are accounted for by the 1-digit to 8-digit 18-asically increasing numbers ($\binom{17}{1} + \binom{17}{2} + \dots + \binom{17}{8} = 2^{16} - 1$). This means that the next number, or the $2^{16}$-th number, is the smallest 9-digit 18-asically increasing number, which is 123456789.

</details>
