---
title: Christmas Ornaments in Double Time
date: 2025-12-26
tags: Math
---

Merry Christmas to those who celebrate, and I hope we were able to spend some time with our loved ones!

## Problem

Let $n$ be a positive integer. On the table, we have $n^2$ ornaments in $n$ different colors but not necessarily $n$ of each color. Prove that we can hang the ornaments on $n$ Christmas trees in such a way that there are exactly $n$ ornaments on each tree and the ornaments on every tree are of at most 2 different colors.

## Solution

<details class="spoiler" markdown="1">
<summary>Show solution</summary>

We instead solve the generalized problem of having $mn$ ornaments of $m$ different colors to be placed on $n$ Christmas trees.

Let the number of ornaments in the $m$ colors be represented by an *ordering $c_1 \le c_2 \le \ldots \le c_m$* where $c_i$ is the number of ornaments of a color $i$. Let us also denote a *move* placing $n$ ornaments on a tree, meaning that tree is full.

The key insight here is that *it is always possible after each move to "eliminate" one color entirely*. (Note that when a color gets eliminated, it will be removed from the ordering.)

The average number of ornaments across all colors is $n$, and thus by Pigeonhole Principle, there exists at least one color with at most $n$ ornaments of that type, and another color with at least $n$ ornaments of that type. This allows us to run the following inductive algorithm for $k$ colors of ornaments which are not eliminated:

> - Take an ordering of the non-eliminated $k$ colors of ornaments, where we know from the previous paragraph that there exists $c_1 \le n$ and $c_k \ge n$.
> - Our move will be to place all $c_1$ ornaments of color $1$ and $n - c_1$ ornaments of color $k$ on one tree, filling it up. (*why do we know for sure that we can do this? also, think about what is left over before reading on!*)

There are a couple of important things to notice about this process.

- Before the first iteration of the algorithm, we claimed that the average number of ornaments across the colors is $n$. During each iteration, we place $c_1 + (n - c_1) = n$ ornaments, as well as eliminate the color denoted as "1". This means that the average number of remaining ornaments across all remaining colors is still $n$.
- *At the start of each successive iteration, we are performing a reordering of the ornaments*. This means that ornaments which were once called a certain color $i$ might now be called color $j$ (due to some ornaments being lost from the ornaments of the maximum color in the previous step). But since the mean stays the same, Pigeonhole Principle still holds to allow our algorithm to work!

Therefore, we may repeat this algorithmic pairing until all ornaments are on the trees as desired.

</details>
