---
title: A sample post (delete me)
subtitle: A draft that exercises everything the Writing section supports. It stays hidden from the site until you remove the draft line.
date: 2026-10-09
tags: Math, Thoughts
draft: true
---

This post is only here to show how writing looks and to test the math. Inline math works with dollar signs, like $e^{i\pi} + 1 = 0$, or with parentheses, like \(\sum_{k=1}^n k = \tfrac{n(n+1)}{2}\). Prices still work: it costs \$5 and then \$6. Underscores and asterisks inside math are left alone: $a_1 * b_2^{*}$.

## Display math

A formula on its own line is centered:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}.
$$

Numbered equations can be referred to. By \eqref{eq:cs} below we have

\begin{equation}\label{eq:cs}
\left|\sum_{i=1}^n a_i b_i\right|^2 \le \left(\sum_{i=1}^n a_i^2\right)\left(\sum_{i=1}^n b_i^2\right).
\end{equation}

Multi-line derivations use `align`, and each line can carry its own label:

\begin{align}
(a+b)^2 &= a^2 + 2ab + b^2 \label{eq:sq}\\
        &\ge 4ab \qquad \text{when } a = b. \notag
\end{align}

Matrices and cases work too:

$$
A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}, \qquad
|x| = \begin{cases} x & x \ge 0 \\ -x & x < 0. \end{cases}
$$

## Theorems and proofs

::: theorem Cauchy–Schwarz
For all vectors $u, v$ in an inner product space, $|\langle u, v\rangle| \le \|u\|\,\|v\|$.
:::

::: proof
If $v = 0$ there is nothing to show. Otherwise set $w = u - \frac{\langle u,v\rangle}{\langle v,v\rangle}v$, so that $\langle w, v\rangle = 0$ and
$$0 \le \|w\|^2 = \|u\|^2 - \frac{|\langle u,v\rangle|^2}{\|v\|^2}.$$
Rearranging gives the claim.
:::

::: definition
A *Cauchy sequence* is one whose terms eventually stay within any $\varepsilon > 0$ of each other.
:::

::: remark
Boxes for `lemma`, `proposition`, `corollary`, `claim`, `example`, `remark`, `note` and `exercise` work the same way.
:::

## Everything else

Text can be **bold**, *italic*, with `inline code`, and a footnote looks like this.[^1]

> A block quote, for the occasional borrowed line.

| Player | Points | Games |
|---|---:|---:|
| A | 25.1 | 70 |
| B | 18.4 | 82 |

```python
def collatz(n):
    return n // 2 if n % 2 == 0 else 3 * n + 1
```

[^1]: Footnotes collect at the bottom of the post.
