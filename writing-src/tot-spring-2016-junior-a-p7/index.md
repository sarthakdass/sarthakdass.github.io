---
title: TOT Spring 2016 Junior A P7
date: 2025-08-31
tags: Math
---

## Problem

Let $n > 2$ be an integer. There are $2n+1$ batteries, of which $n+1$ batteries are good and $n$ batteries are bad. A lamp uses two batteries, and it works only if both batteries are good. What is the least number of attempts needed to make the lamp work?

<details class="spoiler" markdown="1"><summary>Show solution</summary>

## Solution

Surprisingly difficult to rigorously prove for the necessary step.

### $n+2$ attempts are sufficient.

Take $2n$ of the $2n+1$ batteries and split them up into two sets of $n$ batteries, $A$ and $B$, with an extra battery $C$. Label the batteries in each set $A_1, A_2, \ldots, A_n$ and $B_1, B_2, \ldots, B_n$. We test $n$ pairs of the form $(A_i, B_i)$ for $i = 1$ to $n$. If none of these pairs light the lamp, then $C$ must be a good battery, and every pair has one good and one bad battery. We only need to test up to two more pairs $(A_1, C)$ and $(B_1, C)$ to get a guaranteed pair of two good batteries.

### $n+2$ attempts are necessary. ($n+1$ moves are not sufficient)

Consider the graph $G$ with $2n+1$ vertices representing the batteries. There are a total of $\binom{2n+1}{2} = 2n^2 + n$ possible edges which could be drawn.

For sake of contradiction, we assume $n+1$ attempts (which form $n+1$ edges) are enough to determine two good batteries.

::: claim
There must exist an **independent set** (*a set of vertices in a graph where no two vertices are connected by an edge*) of size $n+1$.
:::

This claim suffices because discerning batteries from being good or bad is impossible, so we cannot identify the $(n+1)$-**clique** (*a $n$-clique, or $K_n$, is a subset of $n$ vertices where all possible pairs of vertices in the subset are connected by an edge*) of all good batteries.

To do this, we will look at the **complement graph** $G'$ (*if two vertices were connected by an edge in $G$, that edge will not show up in $G'$ and if two vertices were not connected by an edge in $G$, they will be connected by an edge in $G'$*). By our contradiction assumption, $G'$ has $2n^2 + n - (n+1) = 2n^2 - 1$ edges. Instead of an independent set in $G$, we are now looking for a $(n+1)$-clique $K_{n+1}$ in $G'$.

::: theorem Turan's Theorem
Let $H$ be a graph on $n$ vertices without a $(k+1)$-clique. Then the number of edges is bounded by

$$m \le \frac{k-1}{k} \cdot \frac{n^2}{2}$$
:::

By **Turan's Theorem**, the maximum number of edges in a graph with $2n+1$ vertices without $K_{n+1}$ is

$$\frac{n-1}{n} \cdot \frac{(2n+1)^2}{2} = \frac{(n-1)(4n^2+4n+1)}{2n} = \frac{4n^3-3n-1}{2n} = 2n^2 - \frac{3}{2} - \frac{1}{2n}$$

which is clearly less than the number of edges in $G'$

$$2n^2 - \frac{3}{2} - \frac{1}{2n} < 2n^2 - 1$$

Hence $G'$ must have a $K_{n+1}$.

</details>
