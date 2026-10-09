---
title: Seventh Woods
subtitle: "Source: The USSR Olympiad problem book Problem 54(a)"
date: 2025-10-02
tags: Math
---

## Problem

Let $A$ and $B$ be two distinct seven-digit numbers, each of which contains all of the digits 1 through 7. Prove that $A$ can never be divisible by $B$.

## Solution

<details class="spoiler" markdown="1"><summary>Show solution</summary>

The sum of the digits of each number is $1+2+3+4+5+6+7 = 28 \equiv 1 \pmod 9$, meaning both numbers $A$ and $B$ must leave a remainder of 1 when divided by 9.

AFSOC (Assume for sake of contradiction) $A/B = n$, or equivalently $A = B \cdot n$, where $n$ is an integer. Since $A$ and $B$ are both $1 \pmod 9$, $n$ must also be $1 \pmod 9$ (1, 10, 19, etc.)

$n=1$ is impossible due to distinction of $A$ and $B$

$n\ge 10$ is impossible since $A$ and $B$ are within the same order of magnitude (both 7 digits)

</details>
