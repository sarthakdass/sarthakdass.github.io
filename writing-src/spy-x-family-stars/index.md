---
title: Spy x Family Stars
date: 2025-10-20
tags: Math
---

## Problem

Let $n \ge 5$ be a positive integer. There are $n$ stars with values $1$ to $n$, respectively. Anya and Bond play a game. Before the game starts, Anya places the $n$ stars with faceup numbers in a row in whatever order she wishes. Then, starting with Bond, each player takes the left-most or right-most star in the row in alternating turns. After all the stars have been taken, the player with the highest total sum value of stars wins; if their total values are the same, then the game ends in a draw. Find all $n$ such that Bond has a winning strategy.

![Bond and Anya from Spy x Family](fig1.png)

<details class="spoiler" markdown="1"><summary>Show solution</summary>

## Solution

We first show that for all odd $n$, Anya has a winning strategy.

Let $n = 2k+1$ for some $k \ge 2$. As Anya has the power to place the stars wherever she wants to start the game, she places the stars $1$ through $k+1$ at all of the odd locations and the rest of the stars in the even locations (in any order), with one example as such:

$$1, k+2, 2, k+3, \dots, 2k, k, 2k+1, k+1$$

Anya's strategy will be to take a star from the same end that Bond took their most recent star from. This way, Anya can guarantee leaving Bond with stars $1$ to $k+1$, with Anya receiving stars $k+2$ to $2k+1$. We can check to see for which values of $k$ is Bond's sum smaller.

\begin{align}
1 + 2 + \cdots + (k+1) = \frac{(k+1)(k+2)}{2} &< \frac{(2k+1)(2k+2)}{4} \qquad \text{(RHS is half of the total)}\\
k^2 + 3k + 2 &< 2k^2 + 3k + 1\\
1 &< k^2 \qquad \text{(true for all } k > 1\text{)}
\end{align}

The inequality being true for all $k > 1$ implies it must be true for all $k \ge 2$, which is the same as our condition $n \ge 5$. Bond will indeed receive less than half of the total and thus lose in this scenario.

We will next show for all possible $n \equiv 0 \bmod 4$, Bond has no chance of winning. Anya has a setup where she and Bond will draw with optimal play.

Let $n = 4k+4$ for some $k \ge 1$. Anya performs the following partition of the $4k+4$ numbers into two sets:

$$\{k+2, k+3, \dots, 3k+2, 3k+3\}$$

and

$$\{4k+4, 4k+3, \dots, 3k+4, k+1, \dots, 2, 1\}$$

If this is unclear, the first set consists of the "middle" $2k+2$ numbers $k+2$ to $3k+3$ in ascending order. The second set is comprised of the "extreme" numbers --- $4k+4$ to $3k+4$ and $k+1$ to $1$ in descending order. Note that these two sets have the same sum of elements.

Anya then places the first set's elements at odd locations and the second set's elements at even locations as such:

$$k+2, 4k+4, k+3, 4k+3, \dots, 2k+2, 3k+4, 2k+3, k+1, \dots, 3k+2, 2, 3k+3, 1$$

Anya's strategy remains the same as the previous case: take a star from the same end that Bond took their most recent star from.

If Bond took at least half of their stars from the left end, Anya certainly obtains the numbers $4k+4, 4k+3, \dots, 3k+4$. Continuing onwards, note that the worst sum Anya could get is continuously receiving the rest of the numbers in the even positions. This gives her the second set of numbers, which we found was half of the total sum.

Instead, if Bond took at least half of their stars from the right end, Anya certainly obtains the numbers $3k+3, 3k+2, \dots, 2k+3$. Continuing onwards, the worst sum Anya could get is continuously receiving the rest of the numbers in the odd positions. This gives her the first set of numbers, which we also found was half of the total sum.

Therefore, Anya is guaranteed to receive at least half of the total sum, so there is no chance for Bond to win. Optimal play leads to draw.

We will finally show for all possible $n \equiv 2 \bmod 4$, Bond has a winning strategy.

Let $n = 4k+2$ for some $k \ge 1$. Note that the total sum will not be even:

$$1 + 2 + \cdots + (4k+2) = \frac{(4k+2)(4k+3)}{2} = (2k+1)(4k+3)$$

Bond can simply calculate if the numbers in the even positions or if the numbers in odd positions have a greater sum and take the stars from the positions of whichever sum is bigger.

**Answer:** all $n \equiv 2 \bmod 4$

</details>
