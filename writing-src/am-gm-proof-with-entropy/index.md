---
title: AM-GM Proof with Entropy
date: 2025-10-22
tags: Math
---

I attended a colloquium with a lecture by Professor Tadashi Tokieda, a professor at Stanford who applies physics to explain mathematics, this Tuesday. He shared how he found a derivation of the AM-GM inequality involving entropy with fairly elementary methods, which I really loved and will detail here to the best of my memory.

## Proof

We start with a collection of bodies of mass

$$m_1, m_2, ...$$

all with specific heat $c$. We denote

$$p_i = \frac{m_i}{M}, \quad M = \sum_i m_i$$

Each of the $p_i$ values are "weights" satisfying $0 \le p_i \le 1$ and these weights all sum to 1. We represent the initial temperatures by

$$T_1, T_2, ...$$

Let us bring the masses in thermal contact with one another. By thermal equilibrium we may claim

$$T' = \sum_i p_i T_i$$

where $T'$ represents the asymptotic common temperature reached.

The next step is to model the temperature change. Assuming that the $i$th body of mass $m_i$ experiences a change in temperature by $dT_i$, the heat it receives is $cMp_i\, dT_i$ by the heat transfer formula. Thus, by definition entropy changes by

$$dS_i = \frac{cMp_i\, dT_i}{T_i} = cMp_i \frac{dT_i}{T_i} = cMp_i \cdot d\log T_i$$

Letting the process run from its initial state to its final state via an integral,

$$S_i^{final} - S_i^{initial} = cM\left(p_i \log T' - p_i \log T_i\right)$$

The natural next step is to take the summation of all bodies

\begin{align}
\sum_i S_i^{final} - \sum_i S_i^{initial} &= cM\left(\sum_i p_i \log T' - \sum_i p_i \log T_i\right)\\
&= cM\left(\sum_i p_i \log T' - \sum_i \log T_i^{p_i}\right)\\
&= cM\left(\sum_i p_i \log T' - \log \prod_i T_i^{p_i}\right)
\end{align}

By the second law of thermodynamics, the total entropy of this system never decreases, so the LHS must be nonnegative; this in turn immediately implies the RHS is nonnegative as well. As specific heat is always positive along with the sum of the masses, the parenthetical expression must be nonnegative as well.

\begin{align}
\log T' - \log \prod_i T_i^{p_i} &\ge 0\\
\log T' &\ge \log \prod_i T_i^{p_i}\\
T' &\ge T_1^{p_1} \times T_2^{p_2} \dots\\
p_1 T_1 + p_2 T_2 + \dots &\ge T_1^{p_1} \times T_2^{p_2} \dots\\
\sum p_i T_i &\ge \prod_i T_i^{p_i}
\end{align}

Our final inequality is the weighted AM-GM inequality!

The bound is only sharp when all of the initial temperature $T_i$ values are all equal, which is naturally logical as this is the only scenario in which there would have been zero heat transfer.

There is so much beauty in this proof: it's elegant and it's simple.
