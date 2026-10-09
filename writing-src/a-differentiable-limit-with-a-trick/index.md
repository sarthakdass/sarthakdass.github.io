---
title: A Differentiable Limit with a Trick
date: 2026-04-11
tags: Math
---

Let's solve the final **Problem of the Fortnight** for my university's winter quarter.

> Let $f : (0, \infty) \to \R$ be differentiable and assume that
>
> $$\lim_{x \to \infty} (f(x) + f'(x)) = 0$$
>
> Show that
>
> $$\lim_{x \to \infty} f(x) = 0$$

Of course, a solution was posted at the end of the quarter, but I will show another way to solve this problem over the course of this blog post by building up a trick! Let's solve a similar looking "cool problem" first.

## Cool Problem

Does there exist a differentiable function $f : \R \to \R$ for which

$$\lim_{x \to \infty} f(x) = 2 \qquad \lim_{x \to \infty} f'(x) = 1?$$

## Hint:

![A teal circle containing a double exclamation mark](fig1.png)

**Incredibly, L'Hôpital's rule.**

## Solution (!!)

<details class="spoiler" markdown="1">
<summary>Show solution</summary>

An absolutely wild approach uses L'Hôpital's rule. Suppose for contradiction there exists such a function $f$. Then we proceed as follows:

$$
\begin{aligned}
2 &= \lim_{x \to \infty} f(x) \\
&= \lim_{x \to \infty} \frac{f(x)e^x}{e^x} \\
&= \lim_{x \to \infty} \frac{\frac{d}{dx} f(x)e^x}{\frac{d}{dx} e^x} && \text{(L'Hôpital's rule)} \\
&= \lim_{x \to \infty} \frac{f'(x)e^x + f(x)e^x}{e^x} && \text{(Product rule)} \\
&= \lim_{x \to \infty} f'(x) + f(x) \\
&= 1 + 2 \\
&= 3
\end{aligned}
$$

Absurd.

Of course, we still need to be rigorous to ensure that we really can apply L'Hôpital's rule. In particular, we need to check that

- $f(x)e^x$ is differentiable and approaches $\infty$ as $x \to \infty$
- $e^x$ is differentiable and approaches $\infty$ as $x \to \infty$
- $\displaystyle\lim_{x \to \infty} \frac{f'(x)e^x + f(x)e^x}{e^x}$ exists and is finite

and of course, all of these are certainly true.

## Solution (Standard)

There is no denying the slick creativity of the first solution, but this seems to be more of a one-off trick (...or is it?) instead of a standard approach. Regardless, I would be remiss to not also write out the typical methodology.

Again, we suppose for contradiction that such an $f$ exists. This implies there exists $K > 0$ sufficiently large such that

- $|f(x) - 2| < 1$ for all $x \ge K$ and
- $|f'(x) - 1| < \frac{1}{2}$ for all $x \ge K$.

Next, we analyze $a = K$ and $b = K + 100$. By the Mean Value Theorem, there exists $c \in (a, b)$ such that

$$f'(c) = \frac{f(b) - f(a)}{b - a} = \frac{f(b) - f(a)}{100}$$

Since $c \ge K$, we have that $|f'(c) - 1| < 1/2$. Therefore,

$$\left| \frac{f(b) - f(a)}{100} - 1 \right| < \frac{1}{2}.$$

In particular,

$$\frac{f(b) - f(a)}{100} > \frac{1}{2} \text{ and so } f(b) - f(a) > 50.$$

But now we have the following (thanks to the Triangle Inequality):

$$50 < f(b) - f(a) \le |f(b) - f(a)| \le |f(b) - 2| + |2 - f(a)| < 2$$

Absurd.

## The Original Problem's Solution

Let us now consider a generalization of the original problem that cannot be tackled by the methodology shown in **Solution (Standard)**.

**Problem:** Suppose that $f : \R \to \R$ is differentiable such that there exists the limit

$$\lim_{x \to \infty} f(x) + f'(x) = L,$$

with $L$ finite. Prove that

$$\lim_{x \to \infty} f(x) = L \text{ and } \lim_{x \to \infty} f'(x) = 0.$$

*Solution:*

The intent behind this presentation of the problem is to highly motivate the approach in **Solution (!!)**. This might feel like an easy win at first glance, but actually, this is not so plain. Let us look at a seemingly reasonable, but **incorrect solution:**

> Applying L'Hôpital's rule as in Solution (!!), we write the following steps:
>
> $$\lim_{x \to \infty} f(x) = \lim_{x \to \infty} \frac{f(x)e^x}{e^x} \overset{?}{=} \lim_{x \to \infty} \frac{f(x)e^x + f'(x)e^x}{e^x} = \lim_{x \to \infty} f(x) + f'(x) = L$$
>
> Thus, proved.

As indicated by the suspicious question mark over the equal sign, we are not justified to use L'Hôpital's rule. Looking back at our bullet points, we can see that the issue here is that it is unknown if $f(x)e^x \to \infty$ as $x \to \infty$.

If we wanted to apply L'Hôpital's rule, we actually don't necessarily need to have $f(x)e^x \to \infty$ as $x \to \infty$; we could also have $f(x)e^x \to -\infty$ as $x \to \infty$. Thus, it suffices to prove that $f(x)$ is *either bounded from below or bounded from above* for all $x \ge 0$. The reason for this is because if, say, $f(x) \ge -M$ for all $x \ge 0$, then we simply look at $g(x) := f(x) + M + 1$ such that $g(x) \ge 1$. We then have $g(x) + g'(x) \to L + M + 1$ and $g(x)e^x \to \infty$ as $x \to \infty$, so we simply apply our trick to $g$!

We suppose for contradiction that $f(x)$ is unbounded from above and below over $x \ge 0$. Then it can be shown that there exists an increasing sequence of local maxima $x_n$ of $f$ with $x_n \to \infty$ and $f(x_n) \to \infty$. This is not too hard and so I leave this as an instructive exercise. But to offer some intuition, if we wish for $f$ to be unbounded above and below, it must reach higher and higher peaks (as well as lower and lower valleys), where we choose $x_n$ to be the $x$-coordinates of each successive peak. It then follows that

$$\infty > L = \lim_{x \to \infty} f(x) + f'(x) = \lim_{n \to \infty} f(x_n) + f'(x_n) = \lim_{n \to \infty} f(x_n) = \infty$$

Absurd.

</details>
