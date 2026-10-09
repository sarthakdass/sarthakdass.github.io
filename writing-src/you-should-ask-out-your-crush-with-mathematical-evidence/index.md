---
title: You Should Ask Out Your Crush, with Mathematical Evidence
date: 2026-02-14
tags: Math
---

Most of my posts are meticulously planned and drafted, but some are a spur of the moment piece of writing, and this post will be one of them. This is an extremely brief note that I'll probably edit / expand in the future, but I decided to rush this post since the only appropriate time to post this is, of course, Valentine's Day.

The key idea is that if you are proactive, then you maximize your chances of getting what you want. This idea is portrayed almost perfectly by something called the **Gale-Shapley** algorithm.

## The Problem (Stable Marriage)

With sincere apologies to the lack of representation of those of other gender identities, let us suppose that there are $n$ men and $n$ women. Each man has some preference list for the women, and each woman has a preference list for the men. For example, let's say $n = 3$. Let's denote the men as Albert, Bob, and Charlie, and the women as Diane, Eve, and Flora.

A possible preference list for the men could be:

- Albert: Diane > Eve > Flora
- Bob: Eve > Flora > Diane
- Charlie: Diane > Flora > Eve

A possible preference list for the women could be:

- Diane: Charlie > Albert > Bob
- Eve: Charlie > Albert > Bob
- Flora: Albert > Charlie > Bob

The **Stable Marriage Problem** asks: Can you always pair up these men and women such that the marriages are *stable*? An unstable matching is one where **there exists both a man $M$ and a woman $W$ that are NOT matched and yet prefer each other over their current partners**.

::: example
**Example Problem:** Suppose we match up the above three men and women with their listed preferences à la (Albert, Eve), (Bob, Diane), and (Charlie, Flora). Is this marriage stable?

*Example Answer:* This is NOT a stable marriage because Charlie prefers Diane over Flora, and Diane prefers Charlie over Bob. That is, Charlie and Diane prefer each other over their current partners. In fact, any perfect matching would *have* to pair up Charlie and Diane! (why?)
:::

## The Gale-Shapley Algorithm

The answer to the Stable Marriage Problem is **yes**, and one proof of this uses an *algorithm* that the men and women could follow to come up with a pairing of marriages that must be stable.

I'm not sure if I'll expand upon this later, but for now I'll just link the Wikipedia page: [Gale–Shapley algorithm - Wikipedia](https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm).

Here are the key points though:

1. **This algorithm works!**
   It results in a stable marriage. In the marriages that occur at the end of the algorithm, it's guaranteed that no two people will prefer each other over their assigned partners. This solves the Stable Marriage Problem.
2. **If the men are the proposers, then the algorithm favors the men.**
   That is, the resulting set of marriages is "best for all men" and "worst for all women".
3. **If the women are the proposers, then the algorithm favors the women.**
   The reverse holds true! In general, *those that propose will get the optimal outcomes*.

Essentially, the takeaway here is that being proactive (being a proposer/ask-outer) yields good results, and being passive (waiting to be proposed/asked out) yields worse results. Thus, it is mathematically optimal for you to ask out your crush. (Note: this advice also holds universally for other things such as job applications)

*This is also the most hypocritical post I have ever made.*
