---
title: Mathematical Modeling - Allele Frequencies
date: 2026-01-20
tags: Math
---

## Introductory Premise

Let's say that in the *Dogminican Republic*, there exists a population of 100 dogs with the following distribution:

- 45 with blue eyes (homozygous dominant)
- 30 with blue eyes (heterozygous dominant)
- 25 with brown eyes (homozygous recessive)

The question we wish to investigate here is after many future generations, what is the probability that all of the dogs will eventually end up with brown eyes?

Miraculously, the answer to this question is precisely **the proportion of the dogs' alleles which are the brown-eyes allele**. It's shocking, but it should *feel correct*.

Just in case you might have needed a reminder, a trait in this simplified example is determined by two alleles: i.e. this case is written as either BB, Bb, or bb where B is the dominant allele (the blue eyes trait in this example) and b is the recessive allele (the brown eyes trait). BB and Bb both result in blue eyes, whereas bb results in brown eyes.

For the presented example, the 100 dogs here have 200 alleles. We can count the total number of brown alleles as the 25 homozygous brown-eyed dogs contribute 50 brown alleles, and the 30 heterozygous blue-eyed dogs contribute 30 brown alleles. This gives us a proportion of $(50 + 30)/200 = 80/200 = 2/5 = 40\%$.

In order to prove this result, we must be specific about how the frequency of the alleles changes, which we will do via a specific model of genetic drift.

### Wright-Fisher Model

- We start with $N$ alleles, where each allele is either A or B. We actually neither care which is dominant and which is recessive, nor do we care how exactly they are paired up. We maintain that every generation will continue to have $N$ alleles, determined by the previous generation.
- **Base Case**: In generation 0, we say that $X_0 = pN$ of the alleles are A and the rest are B, essentially denoting $p$ as the proportion of $N$ that is A.
- **The Drift**: If on generation $n$, we have that $X_n$ of the alleles are A, then each of the $N$ alleles in generation $n+1$ is decided independently of the others by choosing a (uniform) random allele sample from generation $n$.

    Thus, a particular allele in generation $n+1$ has $X_n/N$ probability of being A and $X_n/N$ probability of being B. In particular, the probability that generation $n+1$ will have $k$ alleles being A is given by:

    $$\Pr(X_{n+1} = k) = \binom{N}{k} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k}$$

    Thus, we can essentially understand that given what $X_n$ is, we now have that $X_{n+1}$ must have a *Binomial distribution of parameter $X_n/N$*.

Now that we have our model, the theorem which we wish to prove is as follows:

::: theorem
The probability that eventually $X_n$ will become "fixed"/constant at $X_n = N$ (i.e. all of the alleles will become A) is exactly $X_0/N = p$, the initial frequency of the A allele.
:::

## Proof

*Prerequisite: knowledge of martingales.* Otherwise, feel free to scroll down where I'll attempt to provide a colloquial explanation of the proof.

::: claim
The stochastic process $X_n$ is a martingale with respect to the [natural filtration](https://en.wikipedia.org/wiki/Natural_filtration) $\mathcal{F}_n := \sigma(X_0, X_1, \ldots, X_n)$
:::

::: proof
By definition, $X_n$ is clearly $\mathcal{F}_n$-measurable. Moreover, $\E|X_n| \le N < \infty$ for all $n$, thus its finiteness guarantees well-defined integrability. What it remains to show is that $\E(X_{n+1} \mid \mathcal{F}_n) = X_n$, which we may compute:

$$
\begin{aligned}
\E(X_{n+1} \mid \mathcal{F}_n) &= \sum_{k=0}^{N} \binom{N}{k} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k} \cdot k \\
&= \sum_{k=0}^{N} \frac{N!}{k!(N-k)!} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k} \cdot k \\
&= \sum_{k=1}^{N} \frac{N!}{(k-1)!(N-k)!} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k} \\
&= N \sum_{k=1}^{N} \frac{(N-1)!}{(k-1)!(N-k)!} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k} \\
&= N \sum_{k=1}^{N} \binom{N-1}{k-1} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-k} \\
&= N \sum_{k=0}^{N-1} \binom{N-1}{k} \left(\frac{X_n}{N}\right)^{k+1} \left(1 - \frac{X_n}{N}\right)^{N-1-k} \\
&= N \cdot \frac{X_n}{N} \sum_{k=0}^{N-1} \binom{N-1}{k} \left(\frac{X_n}{N}\right)^k \left(1 - \frac{X_n}{N}\right)^{N-1-k} \\
&= X_n \left(\frac{X_n}{N} + 1 - \frac{X_n}{N}\right)^{N-1} \\
&= X_n
\end{aligned}
$$
:::

Nice! Next, we may define the stopping time $\tau = \inf\{n : X_n \in \{0, N\}\}$.

::: claim
$\tau < \infty$ almost surely.
:::

::: proof
Whether $X_0 \in \{0, N\}$ or not, we must have that

$$\Pr(\tau = 1) \ge \frac{1}{N^N}$$

In other words, there is always a chance, no matter how small, that each successive generation keeps picking the same allele again and again. Then

$$\Pr(\tau > 1) \le 1 - \frac{1}{N^N}$$

Reasoning analogously, we may more generally write

$$\Pr(\tau > n+1 \mid \tau > n) \le 1 - \frac{1}{N^N}$$

and so,

$$\Pr(\tau > n) = \Pr(\tau > 1) \prod_{k=1}^{n-1} \Pr(\tau > k+1 \mid \tau > k) \le \left(1 - \frac{1}{N^N}\right)^n$$

Taking the sum,

$$\sum_{n=0}^{\infty} \Pr(\tau > n) \le \sum_{n=0}^{\infty} \left(1 - \frac{1}{N^N}\right)^n < \infty$$

Note that the LHS has precisely become $\E[\tau]$, so $\E[\tau] < \infty$, and thus we have proven our claim that indeed, $\tau < \infty$ almost surely.
:::

We now have the tools we need to finish this proof, namely: we have $X$ is a nonnegative martingale and $\tau < \infty$ almost surely. Thus we may invoke the **Martingale Stopping Theorem** (a.k.a. **Doob's Optional Stopping Theorem**) as it then follows that $\E X_\tau = \E X_0$. Since we know that $X_\tau \in \{0, N\}$, we can also say $N \Pr(X_\tau = N) = \E X_\tau$. We know by our definition that $\E X_0 = pN$, and simplification completes the proof.

$$
\begin{aligned}
\E X_\tau &= \E X_0 \\
N \Pr(X_\tau = N) &= pN \\
\Pr(X_\tau = N) &= p
\end{aligned}
$$

## Understanding

Over time, the number of brown alleles is *not biased to increase or decrease*. This is true even if almost all of the alleles are brown because although it is likely that the number of brown alleles will increase, there always exists the chance that the number of brown alleles could drastically decrease and thus balance would be restored. What this means is that the mean number of brown alleles, over all possible futures, will continue to stay the same because at any point in time, the number of brown alleles isn't biased to go up or down.

The mean fraction of brown alleles at the start of time is merely the starting fraction of brown alleles. This is because we're starting with only one possibility, and nothing has happened yet. We showed that the mean fraction of brown alleles at the end of time is equal to the chance that all the alleles become brown. This is because at the end of time, every possibility ends up with all brown alleles or all blue alleles, and the chance that all the alleles are brown is just the fraction of these possibilities where all the alleles are brown, which is equal to the mean fraction of brown alleles.

These fractions are equal, so the chance that all the alleles end up being brown after a bunch of generations is just the starting fraction of brown alleles.
