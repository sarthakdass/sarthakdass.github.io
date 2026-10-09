---
title: 2004 Russia Olympiad P9.3
date: 2025-08-21
tags: Math
---

## Problem

There are 2004 boxes, where each box has either a white ball or a black ball. A non-zero even number of balls are white. A move consists of picking two boxes and asking whether at least one of them contains a white ball. What is the minimal number of questions required for one to indicate two boxes for sure which both contain white balls?

## Solution

### 4005 moves are sufficient.

Label the boxes 1 through 2004. Our first 2003 moves are for the pairs $(1, 2), (1, 3), \ldots, (1, 2004)$. If any of them is a "no", then 1 is black. The other "yes" answers tell us exactly which boxes are white, and we are done.

Let us instead assume that all of our first 2003 answers are "yes". If 1 were to be black, that means 2 through 2004 must be white, which is impossible since we know we have an even number of white balls. Therefore, 1 must be white.

Our next 2002 moves are for the pairs $(2, 3), (2, 4), \ldots, (2, 2004)$. Again, if any of the answers is "no", 2 is black and the other "yes" answers tell us exactly which boxes are white.

If instead these 2002 moves are all answered with "yes", we show that 2 cannot be black. If 2 is black, then 1 and 3 through 2004 must be all white, which is impossible again by our even white balls condition. Therefore, we know 1 and 2 are white by the 4005th move.

### 4004 moves are not enough. (4005 moves are necessary)

Suppose that the answer to all of the 4004 queries (using any strategy of chosen pairs) is "yes". Also suppose that the claim in the end is that boxes 1 and 2 are white.

Case A: $(1, 2)$ was not queried.

If 1 and 2 are black, and all of the other boxes are white, this fits all the conditions. Any query except $(1, 2)$ would have an answer of "yes" and there are an even number of white balls.

Case B: $(1, 2)$ was queried.

There are 2002 possible queries $(1, n)$ and 2002 possible queries $(2, n)$ where $n$ ranges from 3 to 2004. It is impossible to cover these 4004 pairs of $(1, n)$ and $(2, n)$, as $(1, 2)$ takes up a query. Assume WLOG $(1, m)$ is the pair which was not queried. It is possible that 1 and $m$ are black, and all of the other boxes are white, which fits the conditions as well. The player cannot be sure they are correct.

Hence, proved.

### Graph Theory Equivalent of Necessity Argument

Consider the graph with vertices as boxes and edges as queries. Suppose we answer "yes" to every query and the claimed pair is $(u, v)$. If $uv$ isn't an edge, they could both be black, contradiction. There exists a vertex $w$ such that at most one of $uw$ and $vw$ is an edge (this exists because $4004 < 1 + 2002 + 2002$). If $uw$ is an edge, claim $v$ and $w$ black, $u$ white, contradiction.
