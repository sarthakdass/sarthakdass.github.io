---
title: 2019 RMM P1
date: 2025-09-12
tags: Math
---

## Problem

Amy and Bob play a game. At the beginning, Amy writes down a positive integer on the board. Then the players take moves in turn, Bob moves first. On any move of his, Bob replaces the number $n$ on the blackboard with a positive number of the form $n - a^2$, where $a$ is a positive integer. On any move of hers, Amy replaces the number $n$ on the blackboard with a number of the form $n^k$, where $k$ is a positive integer. Bob wins if the number on the board becomes zero. Can Amy prevent Bob's win?

## Solution

<details class="spoiler" markdown="1"><summary>Show solution</summary>

We may first observe that Amy should never choose an even $k$ on her turn, as the number then becomes square, and Bob instantly wins.

The clever strategy here is to use the unique squarefree representation of an integer. Let us rewrite the number Amy is faced with, $n$, as $q^2 r$ with $r$ squarefree (i.e. $48 = 4^2 \cdot 3$, $22 = 1^2 \cdot 22$). A very cute (but difficult!) claim one can make is that no matter what Amy chooses, Bob can always make the squarefree part of her number, $r$, strictly decrease from the beginning of Amy's turn to the end of his turn.

Amy can only raise this number by an odd power $k$, which we can rewrite as $2m+1$.

$$(q^2 r)^{2m+1} = (q^2 r)^{2m} \cdot q^2 r = (q^{2m} \cdot r^m \cdot q)^2 \cdot r = (q^{2m+1} \cdot r^m)^2 \cdot r$$

Note the amazing fact that after raising this number to an odd power, this new number's squarefree part is still $r$. Bob's next move is to pick $a$ as follows:

$$a = q^{2m+1} \cdot r^m$$

The current number $n$ on the blackboard is:

$$n = (q^{2m+1} \cdot r^m)^2 \cdot r$$

The new number Bob will write is:

$$n - a^2 = (q^{2m+1} \cdot r^m)^2 \cdot r - (q^{2m+1} \cdot r^m)^2 = (q^{2m+1} \cdot r^m)^2 \cdot (r - 1)$$

The new squarefree part is $r - 1$, and so we have proven our claim.

Over time, this squarefree number's part will absolutely dwindle down until eventually the number on the board is a square. The answer is no, Amy can not prevent Bob's win.

</details>

## Further Extension

What is the maximum number of moves Bob needs to guarantee his win?

## Solution (Alternate)

Note that the solution to this problem will clearly solve the initial problem, hence I have merely marked it as an alternate solution, though really this is like cutting butter with a chainsaw.

By Lagrange's Four-Square Theorem, every positive integer can be represented as the sum of four non-negative squares.

If we have $n$ is square already, Bob wins in one turn.

If $n = w^2 + x^2$, then Bob subtracts $x^2$, leaving $w^2$ and winning in two turns.

If $n = w^2 + x^2 + y^2$, Bob subtracts $y^2$, leaving $w^2 + x^2$. If Amy raises this to an odd power, we still always have a sum of two squares.

$$(w^2 + x^2)^{2m+1} = (w^2 + x^2) \cdot (w^2 + x^2)^{2m} = w^2 (w^2 + x^2)^{2m} + x^2 (w^2 + x^2)^{2m}$$

Using what we know before, Bob wins in three turns.

If $n = w^2 + x^2 + y^2 + z^2$, Bob subtracts $z^2$, leaving $w^2 + x^2 + y^2$. Again, if Amy raises this to an odd power, we still always have a sum of three squares.

\begin{align}
(w^2 + x^2 + y^2)^{2m+1} &= (w^2 + x^2 + y^2) \cdot (w^2 + x^2 + y^2)^{2m} \\
&= w^2 (w^2 + x^2 + y^2)^{2m} + x^2 (w^2 + x^2 + y^2)^{2m} + y^2 (w^2 + x^2 + y^2)^{2m}
\end{align}

Therefore, Bob can always win in four moves.
