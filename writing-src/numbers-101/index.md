---
title: Numbers 101
date: 2025-09-28
tags: Math
---

## Problem

Prove that for any positive integer $n$, there exists a positive multiple of $n$ whose digits only consist of 1's and 0's.

## Solution

<details class="spoiler" markdown="1"><summary>Show solution</summary>

We look at the numbers $1, 11, 111, \ldots$, to $111\ldots111$ where the last number consists of $n+1$ 1's. By Pigeonhole Principle, we know that there must exist at least two of the $n+1$ numbers, $a$ and $b$ where $a < b$, which have the same remainder modulo $n$.

Taking the difference of those two numbers $b - a$ yields a number with only 1's and 0's that is also divisible by $n$.

</details>
