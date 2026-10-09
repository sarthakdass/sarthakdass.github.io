---
title: Digit Patterns
date: 2026-09-27
tags: Math
---

Let's say you're thinking about powers of 2. Ignoring $2^0$, you may notice that the last digits of the powers are $2, 4, 8, 6$, and this repeats infinitely. So, $1/4$ of the powers of 2 end in 2, $1/4$ of them end in 4, $1/4$ end in 8, and $1/4$ of them end in 6.

Believe it or not, the distribution of the first digit is also not too difficult to figure out! In fact, I could even ask you to prove that there exists a power of 2 whose first 6 digits are $676767$. For the curious reader, I will provide a few hints below.

## Hints

If $x$ is irrational, then you can show that the set

$$\{mx - n : m, n \in \N\}$$

is *dense* in $\R$. That is, every real number can be approximated as closely as you want with numbers of the form $mx - n$.

Also, powers are products. We could instead turn them into a sum.

## Solution

Set $N := 676767$

Then we are trying to find a power $2^k$ such that

$$10^j N \le 2^k < 10^j (N + 1)$$

for some integer $j$. Taking logs, this is equivalent to

$$j + \log_{10} N \le k \log_{10} 2 < j + \log_{10} (N + 1)$$

or

$$\log_{10} N \le -j + k \log_{10} 2 < \log_{10} (N + 1)$$

But since $\log_{10} 2$ is irrational, the set

$$\{-j + k \log_{10} 2 : j, k \in \N\}$$

is dense in $\R$. So we must be able to find a $(j, k)$ satisfying the inequality.

## Weyl Equidistribution Theorem

Studying successive multiplication by 2 is not exactly fruitful so we take a log. We convert the problem to studying the arithmetic sequence

$$\log_{10} 2, 2 \log_{10} 2, 3 \log_{10} 2, \cdots$$

taken "mod 1" (i.e. taking the fractional parts). This is because, for example, $2^k$ begins with a 6 if and only if $\log_{10} 6 \le \log_{10} 2^k < \log_{10} 7$, and conveniently $\log_{10} 2^k = k \log_{10} 2$.

A nice way to visualize the sequence $\{k \log_{10} 2\}_k$ "mod 1" is to draw a circle with circumference 1. Then, the fractional parts of $k \log_{10} 2$ form an infinite sequence of points on the circle, formed by making "jumps" of length $\log_{10} 2$ along the circumference. If you keep jumping forever, the points you land on intuitively form a dense subset of the circle.

It's also intuitive that the points we land on are "equally distributed". Over the infinitely many points we jump on, there shouldn't be more points near $x$ than $y$. This intuition is formalized by the following theorem, called the Weyl Equidistribution Theorem.

::: theorem Weyl
Suppose we jump around a circle of unit circumference, with each jump being of length $x$ where $x$ is an irrational number. Then, for any arc $I$, we have that the proportion of jumps that land in $I$ is precisely the length of $I$.
:::

If I were to formally write this out:

Let $I$ be an interval of $S^1$ where we view $S^1$ as $\R$ mod 1. Then for any irrational $x$ we have

$$\lim_{n \to \infty} \frac{\#\{0 \le n \le n - 1 : nx \in I\}}{n} = \mathrm{length}(I)$$

Using this theorem, we can compute the exact proportion of powers of 2 that begin with the digit 6. The numbers between $\log_{10} 6$ and $\log_{10} 7$ form an interval of length $\log_{10} 7 - \log_{10} 6$. On the circle, that corresponds to an arc of the same length. Thus, by the Weyl Equidistribution Theorem, the proportion of powers of 2 that begin with 6 is exactly $\log_{10} 7 - \log_{10} 6$.

More generally, the proportion of powers of 2 that begin with the digit $d$ is $\log_{10} (d+1) - \log_{10} d = \log_{10} (1 + 1/d)$.

There is a surprising connection with *ergodic theory*, which is essentially the study of dynamical systems. Essentially, we can view "jumping by $x$" along the circle as iterated compositions of the transformation function $T(y) = y + x \pmod 1$, which is a setting that is handled incredibly well by ergodic theory. It turns out that the transformation is ergodic when $x$ is irrational, and results in ergodic theory can be used to prove the Weyl Equidistribution theorem.

## Benford's Law

If you look at sets of data that span various magnitudes, such as population sizes, it is quite likely that the most common first digit in the data is 1. In fact, the proportion of numbers that begin with 1 in such data sets is typically around $\log_{10} 2$. The pattern continues for other possible starting digits:

- 2: $\log_{10} 3/2$
- 3: $\log_{10} 4/3$
- 4: $\log_{10} 5/4$
- ...

The phenomenon that the first digits tend to follow this distribution is called *Benford's Law*. The numbers here should look familiar from last section...the distribution of the first digits of powers of 2 satisfy Benford's Law exactly!

## Other Digits?

So by Weyl Equidistribution, the proportion of powers of 2 which begin with $676767$ is not too hard. The $n^{\text{th}}$ power of 2 begins with $676767$ exactly when $n \log_{10} 2$ lies on the "arc" between $\log_{10} 676767$ and $\log_{10} 676768$. This proportion is $\log_{10} 676768 - \log_{10} 676767 = \log_{10} (1 + 1/676767)$. This generalizes nicely to saying the proportion of powers of 2 which begin with any positive integer $N$ is exactly $\log_{10} (1 + 1/N)$.

Now here's a fun question: What is the distribution of the $k^{\text{th}}$ digit? Does the distribution of the $k^{\text{th}}$ digit approach some limiting distribution as $k \to \infty$? It turns out that it does! It approaches the uniform $(1/10, \ldots, 1/10)$ distribution exponentially fast.

::: theorem
Let $F_k$ be the proportion of powers of 2 whose $k^{\text{th}}$ digit is $d$. Then $\lim_{k \to \infty} F_k = 1/10$
:::

::: proof
*(Hinted to me by a friend)*

For $k \ge 2$, the $k$th digit is $d$ exactly when the first $k$ digits end in $d$. That is, the first $k$ digits are $10i + d$ where $i$ is a $(k-1)$-digit number. For such an $i$, the proportion of powers of 2 that begin with $10i + d$ is given by

$$\log_{10} \left(1 + \frac{1}{10i+d}\right)$$

as we discussed previously. Since $i$ ranges over $(k-1)$-digit numbers, it will range from $10^{k-2}$ to $10^{k-1} - 1$. Hence the proportion of powers whose $k$th digit is $d$ is given exactly by

$$F_k = \sum_{i=10^{k-2}}^{10^{k-1}-1} \log_{10} \left(1 + \frac{1}{10i+d}\right)$$

But there's no real need to stick with base 10, so we can rewrite as

$$F_k = \frac{1}{\log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \log \left(1 + \frac{1}{10i+d}\right)$$

By Taylor expansion of $\log(1+x)$, we can use the following bound:

$$x - \frac{x^2}{2} < \log(1+x) < x \text{ for } x > 0$$

Thus we now have

$$\frac{1}{\log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{10i+d} - \frac{1}{10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{2(10i+d)^2} < F_k < \frac{1}{\log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{10i+d}$$

Note that the error term is quite small and indeed, we can apply some silly bounds:

$$\sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{(10i+d)^2} \le \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{(10^{k-1})^2} \le \frac{10^{k-1}}{(10^{k-1})^2} \to 0$$

Therefore,

$$\lim_k F_k = \lim_k \frac{1}{\log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{10i+d}$$

We can calculate this limit by rewriting the sum as

$$\frac{1}{\log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{10i+d} = \frac{1}{10 \log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{i+d/10}$$

and use this integral bound

$$\int_i^{i+1} \frac{1}{x+d/10}\, dx \le \frac{1}{i+d/10} \le \int_{i-1}^{i} \frac{1}{x+d/10}\, dx$$

to show

$$\frac{1}{10 \log 10} \int_{10^{k-2}}^{10^{k-1}} \frac{1}{x+d/10}\, dx \le \frac{1}{10 \log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{i+d/10} \le \frac{1}{10 \log 10} \int_{10^{k-2}-1}^{10^{k-1}-1} \frac{1}{x+d/10}\, dx$$

or

$$\frac{1}{10 \log 10} \log \left(\frac{d/10 + 10^{k-1}}{d/10 + 10^{k-2}}\right) \le \frac{1}{10 \log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{i+d/10} \le \frac{1}{10 \log 10} \log \left(\frac{d/10 + 10^{k-1} - 1}{d/10 + 10^{k-2} - 1}\right)$$

But we can be a little clever here and use

$$\lim_{k \to \infty} \log \left(\frac{d/10 + 10^{k-1}}{d/10 + 10^{k-2}}\right) = \lim_{k \to \infty} \log \left(\frac{d/10 + 10^{k-1} - 1}{d/10 + 10^{k-2} - 1}\right) = \log 10$$

thus

$$\lim_{k \to \infty} F_k = \lim_k \frac{1}{10 \log 10} \sum_{i=10^{k-2}}^{10^{k-1}-1} \frac{1}{i+d/10} = \frac{1}{10 \log 10} \log 10 = \frac{1}{10}$$

hence proved.
:::

## Generality

Initially, I mentioned powers of two. But is two actually important here? Absolutely not. As long as $b$ is not a power of 10, this entire post still holds for powers of $b$!

So, for instance, the first digits of $676767^n$ satisfy Benford's Law, and the $k$th digits of the powers of $676767$ approach a uniform distribution as $k \to \infty$.
