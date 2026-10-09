---
title: An Application of Arzela-Ascoli
date: 2026-07-04
tags: Math
---

This is more of a pedagogical note than a post that is trying to teach, so I will be assuming that you are fairly comfortable with the standard real analysis curriculums.

One of the "endgame" goals that are reached by the end of a real analysis course is the celebrated theorem of Arzela-Ascoli.

::: theorem A-A, basic form
Let $f_n : [a, b] \to \R$ be a sequence of functions that is uniformly bounded and uniformly equicontinuous. Then it admits a uniformly converging subsequence.
:::

::: theorem A-A, more general
Let

$$\mathcal{F} \subseteq C_b(X; \R)$$

where $X$ is a separable metric space. If $\mathcal{F}$ is pointwise bounded and pointwise equicontinuous then there exists a sequence $f_n \in \mathcal{F}$ which converges locally uniformly.
:::

I think a problem that could arise when teaching A-A is that it is not clear why anyone would care (fortunately, my analysis professor made it abundantly clear why we should care!). What are the applications of this crown-jewel theorem? One could say that it gives insight into compactness in infinite dimensions, but one should explain why such compactness is more than a mere curiosity.

The first main point is that "compactness" and "taking convergent subsequences" are inseparable concepts to the extent that we may often think of them as being the same (they are very different in mere topological spaces but that's not going to happen until functional analysis so whatever.) A proof which demonstrates this quite well is that for the EVT.

::: theorem EVT
Every continuous $f : K \to \R$ obtains its sup/inf.
:::

::: proof
Let

$$M = \sup_K f.$$

Then there exists $x_n \in K$ such that $f(x_n) \to M$. Taking a subsequence

$$x_{n_k} \to x_0 \in K$$

we have by continuity that $f(x_k) \to f(x_0)$ and so $f(x_0) = M$. (implicitly this also rules out $M = \infty$)
:::

In disguise this is basically the *direct method* in Calculus of Variations, done in the simplest possible setting. So for teaching, it's natural to try and think of an application of A-A that uses the direct method. However, this is somewhat hard because most problems in calculus of variations can't be done with A-A alone (or at all!). An issue with using A-A is that, while it preserves continuity, it does not preserve higher regularity such as differentiation.

So, for example, if we wish to minimize the Dirichlet energy

$$E[f] := \frac{1}{2} \int_a^b |f'|^2 \quad \text{over all } f \in C^1([a, b]) \text{ subject to } f(a) = 0,\ f(b) = 67$$

then it's tempting to let

$$m = \inf_f E[f]$$

and take $f_n$ in the admissible set for which $E[f_n] \to m$. Then it's not hard to see that $f_n$ is uniformly equicontinuous (for example by Hölder,

$$f(y) - f(x) = \int_x^y f' \le |x - y|^{1/2} \norm{f'}_{L^2}$$

which shows that it is equi-1/2-Hölder) and uniformly bounded, so there is a subsequence $f_{n_k}$ converging uniformly. But this means that the limit $f_0$ is only at most of class $C([a, b])$, which breaks everything.

Recovering the regularity is a tough problem, so this is doomed. Studying the direct method, we see that in order to a problem to be solvable using only A-A, we need the following conditions:

- A bound on $E[f_n]$ implies equicontinuity (and uniform boundedness)
- If $f_n \to f$ uniformly then $E[f_n] \to E[f]$

After pondering this in bed one night, I've come up with the perfect solution: Take $E$ to be the best Lipschitz constant of $f$!

::: theorem Flappy Bird
Let $g, h : [0, 100] \to \R$ be functions with $g \le h$, where we think of $g$ being the "lower pipes" and $h$ being the "upper pipes".

A bird starts at $(0, 0)$ and wants to end at $(100, 0)$ while dodging the pipes. That is, we are considering continuous functions $f : [0, 100] \to \R$ such that:

- The bird starts at $(0, 0)$, i.e. $f(0) = 0$
- The bird ends at $(100, 0)$, i.e. $f(100) = 0$
- The bird never hits the pipes, i.e. $g(x) \le f(x) \le h(x)$ for all $x \in [0, 100]$

Prove that if this is possible to do, then there is an $f$ satisfying these conditions for which $\mathrm{Lip}(f)$ is **minimal**.
:::

*(motivation: we don't want the bird to have to fly too steeply up or down, that'll exhaust it for sure!)*

Below I provide a complete solution.

![A Flappy Bird level: a bird flying between green pipes](fig1.png)

<details class="spoiler" markdown="1">
<summary>Show solution</summary>

::: proof
Let $A$ be the set of "legal paths" through the pipes, i.e. $A$ = the set of all continuous functions $[0, 100] \to \R$ satisfying those three conditions points. The "theoretical minimum steepness", then, is

$$m := \inf_{f \in A} \mathrm{Lip}(f).$$

The goal is to show that this infimum is actually a minimum. That is: Find an $f \in A$ such that $\mathrm{Lip}(f) = m$.

Alright, let's start by trying to get close to $m$.

- Since we're given that the Flappy bird level is possible, it follows that $A$ is non-empty.
- Moreover, $\mathrm{Lip}(f) : f \in A$ is bounded from below by 0.
- Non-empty sets bounded from below have an infimum, so $m$ exists and is finite.
- We can always get close to such an infimum: There exists $f_n \in A$ such that

  $$\mathrm{Lip}(f_n) \to m.$$

Great! We now have a sequence of Flappy bird paths $\{f_n\}_n$ whose "steepnesses" approach $m$. How can we procure a function whose "steepness" is exactly $m$…?

Wait hold on, here's an idea:

- Since $\mathrm{Lip}(f_n) \to m$, we know that $\mathrm{Lip}(f_n)$ is a bounded sequence! Let's say it's bounded by $L$.
- From before, we know that a sequence of functions with the same Lipschitz constant is uniformly equicontinuous!
- Moreover, since $f_n$ is $L$-Lipschitz,

  $$|f_n(x)| = |f_n(x) - f_n(0)| \le L|x - 0| \le 100L,$$

  so $\{f_n\}_n$ is uniformly bounded!

Therefore, we can apply Arzela-Ascoli to find a subsequence $f_{n_k}$ which converges uniformly to some $f : [0, 100] \to \R$.

Is this limit, $f$, a valid Flappy bird path?

- Since $f_{n_k} \to f$ uniformly, this convergence is also true pointwise. So, $f_{n_k}(0) \to f(0)$ and $f_{n_k}(100) \to f(100)$. This tells us that $f(0) = 0$ and $f(100) = 0$.
- Does $f$ dodge the pipes? We know that $g(x) \le f_{n_k}(x) \le h(x)$ for all $x$ and $k$. By pointwise convergence, we can send $k \to \infty$ to find that $g(x) \le f(x) \le h(x)$ for all $x$, which means that $f$ dodges the pipes as well.
- Uniform convergence preserves continuity, so $f$ is continuous.

So $f$ is indeed a valid Flappy birth path (i.e. $f \in A$).

Finally, does $f$ actually achieve the theoretical minimum steepness? Well, we know that

$$|f_{n_k}(x) - f_{n_k}(y)| \le \mathrm{Lip}(f_{n_k})|x - y|$$

because that's what Lip means. What happens when we send $k \to \infty$?

So $m$ is at least the steepness of $f$, $\mathrm{Lip}(f)$. But $m$ is the infimum of all possible steepnesses, i.e. $m \le \mathrm{Lip}(f)$. So $m = \mathrm{Lip}(f)$, meaning that we've achieved the minimum possible steepness.
:::

</details>

I think this is a great example for showing how A-A is useful. It's simple and also, in my opinion, is a very interesting result. It's not obviously true, and it may seem quite daunting to prove ("there are so many continuous functions to check!"), so it's very nice that we can actually slay this beast using nothing but A-A! It really demonstrates the power of analysis.

More generally, I'm a proponent of showing students neat applications of the theory of real analysis whenever possible, particular any applications that use some really "big guns" proven in lecture. As another example, using the Banach Fixed Point theorem to show Picard-Lindelöf (or Cauchy-Lipschitz, depending on who you talk to) is very beautiful, as one of my classmates hinted to in his real analysis presentation.

Some folklore applications of A-A include: the existence of length-minimizing paths, convergence boosting for certain harmonic (or holomorphic) sequences of functions, and showing the existence to solutions for ODEs (i.e. Peano's theorem). The first two are rather inaccessible since they require a lot more background to cover them. As for Peano's theorem, I think this is the next best application for A-A, though my main issue with it (aside from requiring integration) is that the proof may be rather technical (even if the "picture" it involves is ultimately quite simple).

If you have other ideas for "elementary" applications of A-A, I'd be quite interested.
