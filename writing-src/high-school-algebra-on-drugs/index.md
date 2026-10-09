---
title: High School Algebra on Drugs
date: 2026-04-20
tags: Math
---

Sillier post today!

The problem is simple. Solve for x.

$$\sqrt{6-x} = 6 - x^2$$

Many of you know how to solve this problem with standard methods, but here is a stupidly funny method which I think was first popularized by Titu Andreescu.

We do the natural thing of squaring both sides of our equation.

$$6 - x = x^4 - 12x^2 + 36$$

Some might say this is a quartic (fourth degree polynomial) in x.

I actually claim this is a quadratic. More specifically, *this is a quadratic in 6*. That is,

$$6^2 - (1 + 2x^2)6 + (x^4 + x) = 0$$

Naturally, we can now solve for 6 by using the quadratic formula:

$$\begin{aligned}
6 &= \frac{(1+2x^2) \pm \sqrt{(1+2x^2)^2 - 4(x^4+x)}}{2} \\
&= \frac{(1+2x^2) \pm \sqrt{1 + 4x^2 + 4x^4 - 4x^4 - 4x}}{2} \\
&= \frac{(1+2x^2) \pm \sqrt{1 - 4x + 4x^2}}{2} \\
&= \frac{(1+2x^2) \pm \sqrt{(1-2x)^2}}{2} \\
&= \frac{(1+2x^2) \pm (1-2x)}{2}
\end{aligned}$$

Looking at the possible cases for the sign of (1 - 2x), we have two possible quadratics

$$6 = \frac{(1+2x^2)+(1-2x)}{2} \qquad\qquad 6 = \frac{(1+2x^2)-(1-2x)}{2}$$

which simplify to

$$0 = 2x^2 - 2x - 10 \qquad\qquad 0 = 2x^2 + 2x - 12$$

and have the following four solutions, of which some will be extraneous

$$x = \frac{1}{2} \pm \frac{\sqrt{21}}{2} \qquad\qquad x = -3, 2$$

Testing these back into the original equation, we find that our only solutions are

$$\boxed{x = 2,\ \frac{1}{2} - \frac{\sqrt{21}}{2}}$$
