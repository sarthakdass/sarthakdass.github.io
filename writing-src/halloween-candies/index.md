---
title: Halloween Candies
subtitle: Equivalent of a problem from Professor Tokieda's Colloquium lecture
date: 2025-11-14
tags: Math
---

## Problem

There are $n$ pieces of Halloween candy in a pile. One is allowed to separate a pile in two piles and add the product of the sizes of the two new piles to a running total. The process terminates when each piece of candy is in its own pile. Show that the final sum is independent of the order of the operations performed.

<details class="spoiler" markdown="1"><summary>Show solution</summary>

![A pile of Halloween candy](fig1.png)

## Solution

I claim the answer will be the number of edges in the complete graph with a graph-theoretic approach.

$$K_n = \binom{n}{2}$$

To visualize this, run the process in reverse. We start with $n$ independent vertices (each in their own cluster). Note that each cluster is a complete graph. Each round, we pick two disjoint clusters and merge them, adding the edges of the complete bipartite graph between the clusters. The number of added edges is precisely the product of the cluster sizes. But we preserve the fact that every cluster is a complete graph, so in the end we have a single $K_n$.

</details>
