---
title: "Applications of Complex Numbers"
date: 2026-07-15
section: math
summary: Ten "real" applications of complex numbers, from rotating points and trig identities to the Central Limit Theorem and fractional derivatives, with worked solutions to the exercises.
---

Despite not being "real", complex numbers somehow have fascinating applications to "real" settings. That is, complex numbers can be introduced to solve problems that do not at all reference complex numbers. Despite having seen many such instances, I continue to be amused by these applications. Let's talk about 10 of them:

1. Geometry
2. Trigonometric Identities
3. Sums of Two Squares
4. Roots of Unity Filtering
5. Physics
6. Solving Differential Equations
7. Integrals
8. Infinite sums
9. Proof of the Central Limit Theorem
10. Fractional Derivatives and Embeddings of Fractional Sobolev Spaces

## 1. Geometry

**Rotate points with ease!**

This may be "backwards" in terms of which result depends on the other, but complex numbers are incredibly useful for rotations. This is because when multiplying complex numbers, you are really multiplying their magnitudes and adding their angles. This follows from, say, sine and cosine angle sum formulae, and it is also "easy to see" if you write complex numbers in polar form (though this is not at all a rigorous argument). But where this method really shines is when dealing with cartesian coordinates. If we have a point $(a, b) \in \mathbb{R}^2$, and we wish to rotate this about the origin by $60$ degrees, then complex numbers makes this incredibly simple to execute: Just multiply the complex number $a + bi$ by $\cos(60) + i\sin(60)$.

The second-best way to rotate points is via linear algebra. But even if you remember the rotation matrix, it's probably much faster to use complex numbers. Moreover, you can even use the complex number method to derive the rotation matrix! Since

$$(a + bi)(\cos\theta + i\sin\theta) = a\cos\theta - b\sin\theta + (a\sin\theta + b\cos\theta)i,$$

we see that the rotation of $(a, b)$ about $(0, 0)$ by an angle $\theta$ is given by

$$\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix} \begin{bmatrix} a \\ b \end{bmatrix}.$$

(Yes, we can argue this also by knowing that rotation is a linear transformation and then plugging in basis vectors. But that requires thinking. This method does not!)

::: exercise
Using complex methods, find the area of an equilateral triangle whose vertices have $x$-coordinates $0$, $1$, and $3$, in some order.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Slide the triangle vertically (which changes no $x$-coordinates) so that the vertex with $x$-coordinate $0$ sits at the origin, and call the other two vertices $B$ and $C$. Since the triangle is equilateral, $C$ is $B$ rotated about the origin by $60^\circ$ in one direction or the other. Reflecting over the $x$-axis changes no $x$-coordinates either, so we may assume the rotation is counterclockwise: $C = B\left(\tfrac12 + \tfrac{\sqrt3}{2}i\right)$.

Suppose $B$ is the vertex with $x$-coordinate $1$, so $B = 1 + ki$ for some real $k$. Then

$$\operatorname{Re}(C) = \operatorname{Re}\!\left((1 + ki)\left(\tfrac12 + \tfrac{\sqrt3}{2}i\right)\right) = \tfrac12 - \tfrac{\sqrt3}{2}k = 3,$$

so $k = -\tfrac{5}{\sqrt3}$. The side length $|B|$ then satisfies $|B|^2 = 1 + \tfrac{25}{3} = \tfrac{28}{3}$.

(If instead $B$ is the vertex with $x$-coordinate $3$, then $B = 3 + ki$ and $\operatorname{Re}(C) = \tfrac32 - \tfrac{\sqrt3}{2}k = 1$ gives $k = \tfrac1{\sqrt3}$ and $|B|^2 = 9 + \tfrac13 = \tfrac{28}{3}$ again, as it must.)

An equilateral triangle with side length $s$ has area $\tfrac{\sqrt3}{4}s^2$, so the area is

$$\frac{\sqrt3}{4}\cdot\frac{28}{3} = \boxed{\frac{7\sqrt3}{3}}.$$

</details>
:::

Complex numbers are so intertwined with the concept of rotation that Asymptote's coordinate system is literally complex numbers, which hence allows you to multiply points together.

### Other applications to Euclidean geometry

Viewing the Euclidean plane as being the same as the complex plane $\mathbb{C}$ gives some useful algebraic structure to geometry that allows one to algebraically prove certain statements. It lets you "add" points, of course, though this isn't that thrilling since this is a "standard" vector space operation. The true power (and really the only reason why you'd want to be in the complex plane versus $\mathbb{R}^2$) is the ability to *multiply* points. For example, you can prove that a triangle with vertices $a, b, c \in \mathbb{C}$, listed counterclockwise, is equilateral iff

$$a + \omega b + \omega^2 c = 0$$

where $\omega$ is a primitive third root of unity, such as

$$\omega = e^{2\pi i/3} = \frac{-1}{2} + \frac{\sqrt3}{2}i.$$

::: exercise
Prove this fact. (Avoid "bashing" it, there are nice ways to argue both directions.)

<details class="spoiler" markdown="1"><summary>Solution</summary>

Since $1 + \omega + \omega^2 = 0$, we have $\omega^2 = -1 - \omega$, so

$$a + \omega b + \omega^2 c = (a - c) + \omega(b - c).$$

Hence the condition $a + \omega b + \omega^2 c = 0$ says exactly that

$$a - c = -\omega\,(b - c) = e^{-i\pi/3}(b - c),$$

because $-\omega = e^{i\pi}e^{2\pi i/3} = e^{5\pi i/3} = e^{-i\pi/3}$. In words: the vector from $c$ to $a$ is the vector from $c$ to $b$ turned *clockwise* by $60^\circ$.

($\Leftarrow$) If this holds, then sides $ca$ and $cb$ have the same length and meet at an angle of $60^\circ$. A triangle with two equal sides and a $60^\circ$ angle between them is equilateral.

($\Rightarrow$) If the triangle is equilateral, then $|a - c| = |b - c|$ and the angle at $c$ is $60^\circ$, so $a - c$ is $b - c$ turned by $60^\circ$ in one direction or the other. Listing the vertices $a, b, c$ counterclockwise means that going from $c$ to $b$ to $a$ turns clockwise, which is the clockwise turn above. So $a - c = e^{-i\pi/3}(b - c)$, which is the condition.

(If the vertices are listed clockwise instead, swap $\omega$ and $\omega^2$: the condition becomes $a + \omega^2 b + \omega c = 0$.)

</details>
:::

::: exercise
Use this fact to prove Napoleon's Theorem: if equilateral triangles are erected outward on the three sides of any triangle, then the centers of those three equilateral triangles form an equilateral triangle.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Let the triangle be $ABC$ with vertices $a, b, c \in \mathbb{C}$ listed counterclockwise. Let $a'$ be the apex of the outward equilateral triangle on side $BC$. Going $B \to C \to A'$ turns clockwise (because $A'$ lies on the opposite side of $BC$ from $A$), so the vertices $b, a', c$ are listed counterclockwise, and the fact gives

$$b + \omega a' + \omega^2 c = 0 \quad\Longrightarrow\quad a' = -\omega^2 b - \omega c,$$

using $\omega^{-1} = \omega^2$. The center of an equilateral triangle is its centroid, so the center of the triangle on $BC$ is

$$p = \frac{b + c + a'}{3} = \frac{(1 - \omega^2)b + (1 - \omega)c}{3}.$$

The same computation on the other two sides (shift $a \to b \to c \to a$) gives the other two centers,

$$q = \frac{(1 - \omega^2)c + (1 - \omega)a}{3}, \qquad r = \frac{(1 - \omega^2)a + (1 - \omega)b}{3}.$$

Let $S = a + \omega b + \omega^2 c$. Using $\omega^3 = 1$, we can check that $b + \omega c + \omega^2 a = \omega^2 S$ and $c + \omega a + \omega^2 b = \omega S$. Therefore

$$\begin{aligned}3(p + \omega q + \omega^2 r) &= (1 - \omega^2)(b + \omega c + \omega^2 a) \\ &\qquad + (1 - \omega)(c + \omega a + \omega^2 b) \\ &= \left[(1 - \omega^2)\omega^2 + (1 - \omega)\omega\right]S.\end{aligned}$$

The bracket is $(\omega^2 - \omega) + (\omega - \omega^2) = 0$. So $p + \omega q + \omega^2 r = 0$, and by the fact above (the $\Leftarrow$ direction), $pqr$ is equilateral. $\blacksquare$

</details>
:::

This is just the tip of the iceberg. A more in-depth study of this topic is best deferred to some works of Evan Chen.

## 2. Trigonometric identities made easy

The sine and cosine angle sum identities can be quite difficult to remember on a first encounter. The way I "memorized" them was quite silly: I simply derived them on the spot whenever I needed them, and each subsequent derivation got faster and faster until I could procure them so fast that I had effectively memorized them. Indeed, "proving" the identities reduces to nothing more of the following back-of-the-envelope calculation:

$$\begin{aligned}\cos(A+B) + i\sin(A+B) &= e^{iA}e^{iB} \\ &= (\cos A + i\sin A)(\cos B + i\sin B) \\ &= \cos A\cos B - \sin A\sin B \\ &\qquad + (\cos A\sin B + \sin A\cos B)i.\end{aligned}$$

The angle sum identities can thus be derived in mere seconds!

::: exercise
Derive the triple-angle formula $\cos(3\theta) = 4\cos^3\theta - 3\cos\theta$ using complex methods.

<details class="spoiler" markdown="1"><summary>Solution</summary>

By de Moivre, $\cos(3\theta) + i\sin(3\theta) = (\cos\theta + i\sin\theta)^3$. Expanding the cube and taking real parts,

$$\begin{aligned}\cos(3\theta) &= \cos^3\theta - 3\cos\theta\sin^2\theta \\ &= \cos^3\theta - 3\cos\theta(1 - \cos^2\theta) \\ &= 4\cos^3\theta - 3\cos\theta.\end{aligned}$$

</details>
:::

In general, you see a good bit of "complex bashing" in Olympiad settings that concern trigonometry. Essentially, if one wishes to prove some identity that involves $\sin$ and $\cos$, we can try writing

$$\sin x = \frac{e^{ix} - e^{-ix}}{2i}$$

and

$$\cos x = \frac{e^{ix} + e^{-ix}}{2}.$$

While this can be quite messy, it often ends up clarifying the situation since exponentials are more "flexible" to algebraically work with than sine and cosine.

As a last remark here, let's eviscerate a particularly "fearsome" trigonometric identity: The tangent addition formula for multiple angles. That is,

$$\tan(\theta_1 + \theta_2 + \ldots + \theta_n) = \frac{s_1 - s_3 + s_5 - s_7 + \ldots}{1 - s_2 + s_4 - s_6 + \ldots},$$

where

$$s_k = \sum_{S \subseteq \{1, \cdots, n\},\, |S| = k}\ \prod_{j \in S} \tan\theta_j$$

is the $k$th symmetric polynomial in $\tan\theta_1, \cdots, \tan\theta_n$. For example,

$$\tan(A + B + C) = \frac{\tan A + \tan B + \tan C - \tan A\tan B\tan C}{1 - \tan A\tan B - \tan A\tan C - \tan B\tan C}.$$

When this was taught to me first, I recall the argument being a bit of an inductive mess. But such pains are completely sidestepped using complex numbers!

Let's start by finding a complex number $a$ whose argument is $A$. How about $a = 1 + i\tan A$? Define $b$ and $c$ similarly. Then the product $abc$ has argument $A + B + C$, and $\tan(A + B + C)$ will be given by the quotient of the imaginary and real parts of $abc$. Computing,

$$\begin{aligned}abc &= (1 + i\tan A)(1 + i\tan B)(1 + i\tan C) \\ &= 1 - \tan A\tan B - \tan A\tan C - \tan B\tan C \\ &\qquad + (\tan A + \tan B + \tan C - \tan A\tan B\tan C)i.\end{aligned}$$

The tangent addition formula shows up immediately with practically no effort, and the argument is equally easy for the general case of $n$ angles.

::: exercise
Evaluate the infinite sum

$$\sum_{n=1}^\infty \frac{\cos n}{2^n}$$

using complex numbers.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Since $\cos n = \operatorname{Re}(e^{in})$, the sum is the real part of a geometric series with ratio $e^{i}/2$, which has magnitude $\tfrac12 < 1$:

$$\sum_{n=1}^\infty \left(\frac{e^i}{2}\right)^n = \frac{e^i/2}{1 - e^i/2} = \frac{e^i}{2 - e^i}.$$

Multiplying the top and bottom by the conjugate $2 - e^{-i}$ of the denominator,

$$\frac{e^i}{2 - e^i} = \frac{e^i(2 - e^{-i})}{|2 - e^i|^2} = \frac{2e^i - 1}{5 - 4\cos 1}.$$

Taking the real part,

$$\sum_{n=1}^\infty \frac{\cos n}{2^n} = \boxed{\frac{2\cos 1 - 1}{5 - 4\cos 1}}.$$

</details>
:::

::: exercise
Let $\theta \in \mathbb{R}$ be a constant. Using complex numbers, obtain a closed form for the finite sum

$$a_n := \sum_{k=0}^n \sin(k\theta),$$

and deduce that the sequence $\{a_n\}_{n=0}^\infty$ is bounded. (Note that if $\sin$ is replaced with $\cos$, the same statement holds except for when $\theta$ is an integer multiple of $2\pi$.)

<details class="spoiler" markdown="1"><summary>Solution</summary>

If $\theta$ is an integer multiple of $2\pi$, every term is $0$ and $a_n = 0$ for all $n$, which is bounded. Otherwise $e^{i\theta} \neq 1$, and $a_n$ is the imaginary part of a finite geometric series:

$$\begin{aligned}\sum_{k=0}^n e^{ik\theta} &= \frac{e^{i(n+1)\theta} - 1}{e^{i\theta} - 1} \\ &= \frac{e^{i(n+1)\theta/2}\left(e^{i(n+1)\theta/2} - e^{-i(n+1)\theta/2}\right)}{e^{i\theta/2}\left(e^{i\theta/2} - e^{-i\theta/2}\right)} \\ &= e^{in\theta/2}\,\frac{\sin\frac{(n+1)\theta}{2}}{\sin\frac{\theta}{2}}.\end{aligned}$$

Taking the imaginary part (the factor $e^{in\theta/2}$ contributes $\sin\frac{n\theta}{2}$),

$$a_n = \frac{\sin\frac{n\theta}{2}\,\sin\frac{(n+1)\theta}{2}}{\sin\frac{\theta}{2}}.$$

The numerator has absolute value at most $1$, so $|a_n| \le \dfrac{1}{|\sin(\theta/2)|}$ for every $n$. Hence $\{a_n\}$ is bounded.

</details>
:::

## 3. Sums of two squares

A famous result in elementary number theory is that if there are positive integers $x$ and $y$, each of which can be written as the sum of two perfect squares, then the product $xy$ can also be written as the sum of two squares! This miraculous statement can be proven with the help of complex numbers.

Suppose $x = a^2 + b^2$ and $y = c^2 + d^2$. Then

$$x = |a + bi|^2$$

and

$$y = |c + di|^2.$$

Therefore

$$\begin{aligned}xy &= |a + bi|^2|c + di|^2 \\ &= |(a + bi)(c + di)|^2 \\ &= |ac - bd + (bc + ad)i|^2 \\ &= (ac - bd)^2 + (bc + ad)^2.\end{aligned}$$

Voila.

Of course, one could have jumped straight to the identity $(a^2 + b^2)(c^2 + d^2) = (ac - bd)^2 + (bc + ad)^2$ without ever mentioning complex numbers, but good luck finding this without the help of our imaginary friends.

::: exercise
Using the help of complex numbers, show that if $x$ is a positive even integer that can be written as the sum of two squares, then $x/2$ can also be written as the sum of two squares.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Write $x = a^2 + b^2 = |a + bi|^2$. Since $x$ is even, $a$ and $b$ have the same parity (if one were even and the other odd, $a^2 + b^2$ would be odd). Therefore $a + b$ and $b - a$ are both even. Now divide $a + bi$ by $1 + i$, which has $|1 + i|^2 = 2$:

$$\frac{a + bi}{1 + i} = \frac{(a + bi)(1 - i)}{2} = \frac{a + b}{2} + \frac{b - a}{2}\,i.$$

Both the real and imaginary parts are integers, and taking squared magnitudes,

$$\frac{x}{2} = \frac{|a + bi|^2}{|1 + i|^2} = \left(\frac{a + b}{2}\right)^2 + \left(\frac{b - a}{2}\right)^2.$$

</details>
:::

## 4. Roots of Unity Filtering

Suppose we have a (possibly infinite) polynomial $P(x) = a_0 + a_1x + a_2x^2 + \ldots$. The sum of the coefficients of $P$ is given as $P(1)$, clearly. How about the sum of *every other* coefficient? If we wish to obtain a nice expression for $a_0 + a_2 + a_4 + \ldots$, one trick is to observe that

$$P(1) = a_0 + a_1 + a_2 + a_3 + \ldots$$

$$P(-1) = a_0 - a_1 + a_2 - a_3 + \ldots$$

and then sum these equalities to obtain

$$P(1) + P(-1) = 2a_0 + 2a_2 + 2a_4 + \ldots.$$

We have hence killed all non-even terms by introducing $(-1)$, which lets us conclude that the sum of every other coefficient, $a_0 + a_2 + \ldots$, is exactly $\dfrac{P(1) + P(-1)}{2}$.

What about every *third* coefficient? Is there a nice expression for $a_0 + a_3 + a_6 + \ldots$? The answer is yes, and we can actually do the same trick to obtain it. Last time, we killed all non-even terms using the fact that $1 + (-1) = 0$. How do we kill all *non-multiple-of-3* terms? We simply go into the complex plane, using the fact that $1 + \omega + \omega^2 = 0$ where $\omega$ is a (primitive) third root of unity!

If $\omega$ is, say, $-\dfrac12 + \dfrac{\sqrt3}{2}i$, then $\omega^3 = 1$ and $1 + \omega + \omega^2 = 0$. So $1 + \omega^n + (\omega^2)^n$ is $3$ exactly when $n$ is a multiple of $3$, and otherwise it is $0$, vanishing into thin air. A good picture to have in mind for convincing yourself that this is true, and for visualizing what exactly is going on here, is to view $1^n$, $\omega^n$, and $(\omega^2)^n$ as "propellors" rotating in the complex plane at different speeds. The $1^n$ propellor stays at $1$ without ever moving. The $\omega^n$ propellor starts at $1$ and rotates $120$ degrees counter-clockwise every time $n$ increments. The $(\omega^2)^n$ rotates at twice the speed, rotating $240$ degrees counter-clockwise every time $n$ goes up. In this visualization, the three propellors meet up exactly when $n$ is a multiple of $3$, but otherwise they are evenly spaced around $0$, which causes the cancellation.

To spell out the punchline, we plug in $1$, $\omega$, and $\omega^2$ into $P$ to get

$$P(1) = a_0 + a_1 + a_2 + a_3 + \ldots$$

$$P(\omega) = a_0 + a_1\omega + a_2\omega^2 + a_3\omega^3 + \ldots$$

$$P(\omega^2) = a_0 + a_1\omega^2 + a_2\omega^4 + a_3\omega^6 + \ldots$$

and summing these gives

$$P(1) + P(\omega) + P(\omega^2) = a_0(3) + a_1(0) + a_2(0) + a_3(3) + \ldots.$$

Thus

$$a_0 + a_3 + a_6 + \ldots = \frac{P(1) + P(\omega) + P(\omega^2)}{3}.$$

This neat trick works when $3$ is replaced with any prime number.

This method, known as "Roots of Unity Filtering", is especially useful when applied to certain polynomials $P$. A common choice is $P(x) = (1 + x)^n = \displaystyle\sum_{k=0}^n \binom{n}{k}x^k$, which gives a beautiful expression for sums such as

$$\sum_{k=0}^{100} \binom{300}{3k}.$$

If you haven't seen this little sleight of hand yet, it is worth computing. (And if you're stuck, this demonstration is literally on every other site that talks about roots of unity filtering.)

::: exercise
Use the methods of complex numbers to find a smooth function $f : \mathbb{R} \to \mathbb{R}$, written in closed form, such that the sequence of derivatives of $f$ has period $3$. (That is, $f''' = f$ but $f' \neq f$.) Your expression for $f$ should not involve non-real numbers.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Let $\omega = e^{2\pi i/3} = -\tfrac12 + \tfrac{\sqrt3}{2}i$. The complex function $g(x) = e^{\omega x}$ satisfies $g''' = \omega^3 g = g$, but $g' = \omega g \neq g$. Now take real parts:

$$f(x) = \operatorname{Re}\left(e^{\omega x}\right) = e^{-x/2}\cos\!\left(\frac{\sqrt3}{2}x\right).$$

Since differentiation commutes with taking real parts, $f^{(k)} = \operatorname{Re}\left(\omega^k e^{\omega x}\right)$. In particular $f''' = \operatorname{Re}(\omega^3 e^{\omega x}) = f$, while $f' = \operatorname{Re}(\omega e^{\omega x}) \neq f$ (for example, $f(0) = 1$ but $f'(0) = \operatorname{Re}(\omega) = -\tfrac12$).

</details>
:::

## 5. Acceleration of uniform circular motion

*Disclaimer: I am not a physicist.*

This is rather informal and, as far as I'm aware, not an actual "application" of complex numbers. It's a fun connection to make, however!

If you took some form of physics, you are probably aware that the acceleration of an object undergoing uniform circular motion about a center $O$ is a vector that points *towards* $O$. If you're like me, you probably found this extremely unintuitive and/or remarkable. Why does it point exactly towards the center? Complex numbers can help us understand why. An object rotating about the complex origin $0$ with angular velocity $\omega$ will at

$$e^{i\omega t}$$

after $t$ seconds. This is the position of the object over time. Differentiating gives the velocity over time,

$$i\omega e^{i\omega t}.$$

Lastly, differentiating this gives the acceleration of the object over time,

$$-\omega^2 e^{i\omega t}.$$

The position vector $e^{i\omega t}$ and the acceleration vector $-\omega^2 e^{i\omega t}$ are pointing in opposite directions at all times. In other words, if we place the acceleration vector at the position of the position vector, then it will point towards $0$, the center of rotation.

## 6. Differential Equations

### Elementary Applications

Differential equations can be solved with the help of complex numbers. Consider, for example, the differential equation for periodic motion or whatever it's called,

$$u'' = -ku$$

where $k > 0$ is the spring constant. Practically speaking the "best" way to solve this in my opinion is to make the substitution $u(t) = v(\sqrt{k}\,t)$ to eliminate the $k$, and then guess that $v(t) = a\sin t + b\cos t$. But you'd only guess this if you pretty much know what the solution is (and this would be expected from you in practice), so just for fun let's try and derive the solution "from scratch".

Let $D$ be the "differentiation operator". Then the ODE may be written as $(D^2 + kI)u = 0$, where $I$ is the "identity". We can then make the factorization

$$(D + \sqrt{k}\,iI)(D - \sqrt{k}\,iI)u = 0.$$

(If you haven't seen this trick before, it SHOULD feel suspicious. Fortunately it turns out that this is actually perfectly rigorous if you think hard enough.)

This lets us decouple the ODE into a simple system. Let $v = (D - \sqrt{k}\,iI)u$. Then we can start by solving $(D + \sqrt{k}\,iI)v = 0$, i.e.

$$v' + \sqrt{k}\,iv = 0. \tag{*}$$

Of course, it's crucial to recognize that we are now allowing our solutions to be complex-valued, i.e. of type $\mathbb{R} \to \mathbb{C}$ rather than just $\mathbb{R} \to \mathbb{R}$. This is not a mistake because finding all solutions of the former type will also find all solutions of the latter type.

Solving $(*)$ using your favorite method (such as the rather non-rigorous "separate and integrate", or perhaps using an integrating factor, or even by guessing, like I just did), we end up with $v(t) = v(0)e^{-\sqrt{k}\,it}$. Now, from $v = (D - \sqrt{k}\,iI)u = u' - \sqrt{k}\,iu$, we get a first-order ODE for $u$,

$$v(0)e^{-\sqrt{k}\,it} = u'(t) - \sqrt{k}\,iu(t).$$

Using your favorite method (probably integrating factors), we get the solution

$$u(t) = Ae^{-\sqrt{k}\,it} + Be^{\sqrt{k}\,it}$$

for constants $A$ and $B$. These are all the *complex* solutions. To recover the *real* solutions, some more work should be done, which I will omit. (Do beware that $A$ and $B$ are not necessarily real.)

::: exercise
An ant is placed on each corner of a square of side length $2024$. Each ant walks towards its counter-clockwise neighbor at a speed of $42$ units per second. Eventually the ants will converge at the center of the square. Using complex numbers, prove that each ant will have travelled exactly $2024$ units.

<details class="spoiler" markdown="1"><summary>Solution</summary>

Put the center of the square at the origin. By symmetry, the four ants always sit at the corners of a square centered at the origin, so if one ant is at $z(t)$, the others are at $iz$, $-z$, and $-iz$. The ant at $z$ walks towards its counter-clockwise neighbor at $iz$, so its velocity has magnitude $42$ and direction $\dfrac{iz - z}{|iz - z|}$:

$$z' = 42\cdot\frac{(i - 1)z}{\sqrt2\,|z|}.$$

Write $z = re^{i\theta}$ in polar form, where $r$ and $\theta$ depend on $t$. Then $z' = (r' + ir\theta')e^{i\theta}$, and $\dfrac{i - 1}{\sqrt2} = e^{3\pi i/4} = -\dfrac{1}{\sqrt2} + \dfrac{1}{\sqrt2}i$. Dividing both sides by $e^{i\theta}$ and comparing real parts gives

$$r' = -\frac{42}{\sqrt2}.$$

So each ant's distance from the center shrinks at the constant rate $\dfrac{42}{\sqrt2}$ units per second. The ants start at distance $\dfrac{2024}{\sqrt2}$ (half the diagonal), so they all reach the center at time

$$T = \frac{2024/\sqrt2}{42/\sqrt2} = \frac{2024}{42}.$$

Each ant moves at speed $42$, so it travels $42 \cdot \dfrac{2024}{42} = \boxed{2024}$ units. $\blacksquare$

</details>
:::

### Advanced Applications

This is not the only way to employ complex numbers, however. We can also try using the Fourier Transform, which in this post we define to be

$$\mathcal{F}(u)(\xi) = \hat{u}(\xi) := \int_{\mathbb{R}} u(t)e^{-2\pi i\xi t}\,dt.$$

Provided sufficient regularity and decay properties on $u$, we have that

$$\mathcal{F}(u')(\xi) = -2\pi i\xi\,\mathcal{F}(u)(\xi).$$

This allows us to effectively turn differentiation into multiplication. Applying this to the spring equation,

$$(-2\pi i\xi)^2\hat{u}(\xi) = -k\hat{u}(\xi).$$

Strangely, this equation seems to suggest that the only solution is $\hat{u}(\xi) = 0$, so that $u(x) = 0$. What gives?

The issue is that you can only take the Fourier transform of $u$ provided that $u$ has sufficient decay properties, e.g. something like $|u(x)| \le \dfrac{A}{1 + |x|^2}$. So in a way, trying to solve the spring equation using Fourier methods has given us every possible solution that decays to $0$ at infinity. Indeed, $u(x) = 0$ is the only such solution.

So is this approach doomed? It is not, but fixing this will (1) require some very advanced theory, and (2) doesn't necessarily find all solutions either (the saving grace here, though, is that it does appear to find all solutions "symbolically"). The advanced theory we need is called the theory of *distributions*, particularly that of *tempered distributions*. A full discussion of this will be deferred to a different post because it really is quite advanced, but the gist is that distributions are a generalization of functions. Some properties include:

- If $f$ does not grow too fast, then it is also a tempered distribution.
- If $f$ is a tempered distribution, then you can take its Fourier transform $\hat{f}$ to get another tempered distribution.
- You can add tempered distributions, and this interacts well with the Fourier transform.
- You cannot multiply tempered distributions. But you can multiply tempered distributions by a smooth function. For example, if $f$ is a tempered distribution, then so is $xf(x)$.
- We still have the nice identity $\mathcal{F}(u')(\xi) = -2\pi i\xi\,\mathcal{F}(u)(\xi)$, which holds "in the sense of distributions". That is, you shouldn't view each side as a function. Rather you should see each side as a tempered distribution.

Now let us solve the spring equation, and I will make exactly one (fatal!) error that I shall address at the end. Taking the Fourier transform again gives

$$(-2\pi i\xi)^2\hat{u}(\xi) = -k\hat{u}(\xi).$$

This rearranges to

$$(2\pi\xi - \sqrt{k})(2\pi\xi + \sqrt{k})\hat{u}(\xi) = 0. \tag{*}$$

It might seem like we've wound up at the same problem. Isn't the only solution here $\hat{u}(\xi) = 0$? This would be true if this equation was an equality of functions. But it's an equality of distributions, so the intuitive "algebra" doesn't actually apply. It turns out that the solution to a equation such as $(x - a)f(x) = 0$ for $f$, in the sense of distributions, is given by $f = c \cdot \delta_a$ where $\delta_a$ is the *Dirac delta distribution* at $a$ and $c$ is any constant. This is not that easy to prove, but it is powerful here. Applying this twice to $(*)$, we find the distributional solution

$$\hat{u}(\xi) = c_1\delta_{-\sqrt{k}/(2\pi)} + c_2\delta_{\sqrt{k}/(2\pi)}$$

for any constants $c_1$ and $c_2$. Applying the inverse Fourier transform on both sides recovers the solution to the spring equation. I'll defer the details (and the more rigorous argument) for another post.

I promised that there was a fatal error. Indeed, the error here was the assumption that the solution $u$ could be treated as a (tempered) distribution. Unfortunately, we do not know a priori that this is the case, since a solution such as $u(x) = e^x$ actually grows too fast to be interpreted as a tempered distribution. Hence, this method is unable to rule out candidates such as $u(x) = e^x$.

One silver lining is that if you just "pretend" that you could work with $e^x$ as a distribution and do the algebra to solve a differential equation such as $u' = u$, then you will find that the method still recovers the solution, even though the steps cease to be legal. Also, this tool can be used in conjunction with other theorems to find all solutions or to even just obtain some useful information, particularly in more complicated differential equations.

The Fourier transform (in multiple dimensions) can also be used to solve partial differential equations such as $\Delta u = f$, but I won't pursue this matter here.

## 7. Evaluation of integrals

The topic of using *contour integration* to evaluate certain integrals has been beaten to death, this time by me. For a full discussion please see my post, [Complex Analysis: A Guide to Contour Integration](../complex-analysis-contour-integration/).

I'll add that contour integration isn't the only way for complex numbers to evaluate integrals. If there is a way to introduce complex numbers which can simplify matters, there's a good chance that this can be made to work. Let us, for example, evaluate the integral

$$\int_0^x \frac{1}{1 + t^2}\,dt.$$

The answer, of course, is $\arctan(x)$. Let us try to derive this using complex numbers.

As suggested in my previous writings concerning complex numbers, there are some dangerous pitfalls that we must beware of. It is easy to fall for such traps and end up with nonsense, but fortunately I am here to light the way. We begin by factoring over the complex numbers to rewrite the integral as

$$\frac{1}{2i}\int_0^x \frac{1}{t - i} - \frac{1}{t + i}\,dt.$$

This is perfectly legal. Next, it is in fact true that this integral is simply equal to

$$= \frac{1}{2i}\left[(\log(x - i) - \log(-i)) - (\log(x + i) - \log(i))\right].$$

But you will fall into a pit unless you know precisely what $\log(\cdot)$ means for complex numbers. Here, it refers to the principal logarithm (there is some reasoning that should be applied to justify that this works; namely one ought to avoid the perilous negative real line). A bit more precisely, we are choosing a particular branch of the complex logarithm that contains all the complex numbers we're working with. Working with the principal log (characterized by $\log(re^{i\theta}) = \log r + \theta i$ for $-\pi < \theta < \pi$) and drawing some pictures, we discover the following:

$$\log(x + i) = \log(\sqrt{x^2 + 1}) + \arctan(1/x)i$$

$$\log(x - i) = \log(\sqrt{x^2 + 1}) - \arctan(1/x)i$$

$$\log i = \pi i/2$$

$$\log(-i) = -\pi i/2$$

Hence our integral is

$$\int_0^x \frac{1}{1 + t^2}\,dt = \frac{1}{2i}\left[-2\arctan(1/x)i + \pi i\right] = \boxed{\frac{\pi}{2} - \arctan(1/x)}.$$

This may look different from the claimed integral of $\arctan x$, but fortunately these two expressions are the same (why?).

::: exercise
Evaluate the integral

$$\int_0^\pi e^x\cos x\,dx$$

using complex numbers (instead of the usual integration by parts).

<details class="spoiler" markdown="1"><summary>Solution</summary>

Since $e^x\cos x = \operatorname{Re}\left(e^{x}e^{ix}\right) = \operatorname{Re}\left(e^{(1+i)x}\right)$, and the real part commutes with integration,

$$\int_0^\pi e^x\cos x\,dx = \operatorname{Re}\int_0^\pi e^{(1+i)x}\,dx = \operatorname{Re}\left[\frac{e^{(1+i)\pi} - 1}{1 + i}\right].$$

We computed earlier that $e^{(1+i)\pi} = -e^\pi$, so this is

$$\operatorname{Re}\left[\frac{-e^\pi - 1}{1 + i}\right] = \operatorname{Re}\left[-(e^\pi + 1)\cdot\frac{1 - i}{2}\right] = \boxed{-\frac{e^\pi + 1}{2}}.$$

</details>
:::

## 8. Evaluation of infinite sums

In a previous exercise I asked you to evaluate $\displaystyle\sum_{n=1}^\infty \frac{\cos n}{2^n}$ using complex numbers. This is one instance of complex numbers being the silver bullet for evaluating an infinite sum, but there are other (less elementary) applications.

### Fourier series

The Fourier series of a periodic function is, morally speaking, its Fourier transform under the Fourier transform of "type" $\mathbb{T} \to \mathbb{Z}$. This seemingly "abstract nonsense" view of Fourier series is actually quite helpful for making much of the properties shared by both Fourier series and the "classic" Fourier transform more intuitive. A more extended discussion of Fourier series and/or the Fourier transform will be reserved for a separate post, but I felt motivated to provide a few insights here.

Taking the Fourier series of certain simple functions and plugging some values into them can often lead to interesting identities. Unfortunately the converse is, at least for me, far more difficult; it is a tall task to look at an infinite sum and proceed to conjure up a proof via Fourier series.

Let us, for example, take the function $f(x) = |x|$ over $(-1, 1)$. Morally speaking we view this as a $2$-periodic function on $\mathbb{R}$ by extending $f$ periodically. To obtain the Fourier series of $f$ with high probability of success, and without the help of the extreme "abstract" view, we can follow these steps.

1. Determine what frequencies we need to use. We need to use all frequencies $x \mapsto e^{-i\xi x}$ that repeat every $2$, i.e. are invariant under a phase shift of $2$. It's not hard to reason out that the frequencies we should use are $x \mapsto e^{-n\pi ix}$ for every integer $n$.
2. Scale the frequencies so that they have unit $L^2$ norm. That is, we want to define $e_n(x) := c \cdot e^{-n\pi ix}$ where $c > 0$ is chosen so that $\displaystyle\int_{-1}^1 |e_n(x)|^2\,dx = 1$. Seeing that $|e_n(x)| = 1$, it's not hard to find that $c = 1/\sqrt2$. We need to do this so that the frequencies $\{e_n\}_{n \in \mathbb{Z}}$ form an orthonormal basis for $L^2(-1, 1)$.
3. Now the $n$th Fourier coefficient of $f$ is simply the $e_n$-component of $f$ under the orthonormal basis $\{e_n\}_{n \in \mathbb{Z}}$, which is given by the inner product

$$\begin{aligned}\hat{f}(n) = \langle f, e_n\rangle &= \int_{-1}^1 |x| \cdot \frac{1}{\sqrt2}e^{-n\pi ix}\,dx \\ &= \sqrt2\int_0^1 x\cos(n\pi x)\,dx \\ &= -\sqrt2\int_0^1 \frac{\sin n\pi x}{n\pi}\,dx \\ &= \frac{\sqrt2(\cos(n\pi) - 1)}{n^2\pi^2} \\ &= \begin{cases} 0, & n \text{ even} \\[2pt] \dfrac{-2\sqrt2}{n^2\pi^2}, & n \text{ odd}.\end{cases}\end{aligned}$$

Oh but you'll notice that this actually doesn't work for $n = 0$, so we need to compute separately that

$$\hat{f}(0) = \langle f, e_0\rangle = \int_{-1}^1 |x| \cdot \frac{1}{\sqrt2}\,dx = \frac{1}{\sqrt2}.$$

Voila! You have successfully found the Fourier series

$$\begin{aligned}|x| = f(x) &= \sum_{n=-\infty}^\infty \hat{f}(n)e_n(x) \\ &= \sum_{n < 0,\ \text{odd}} \frac{-2\sqrt2}{n^2\pi^2}e_n(x) + \frac{1}{\sqrt2}e_0 \\ &\qquad + \sum_{n > 0,\ \text{odd}} \frac{-2\sqrt2}{n^2\pi^2}e_n(x)\end{aligned} \tag{*}$$

without memorization. (I *could* combine the positive and negative parts to write everything in terms of $\cos \pi nx$, but I don't want to for reasons that may become apparent. Also I think it's more instructive like this.)

Note that writing down $(*)$ willy-nilly is actually a bit reckless. It is not always going to be true that both sides of $(*)$ are equal for every $x$. To avoid pitfalls, it should first be shown that $f$ is continuous (which is obvious here) and that $\displaystyle\sum_{n \in \mathbb{Z}} |\hat{f}(n)| < \infty$ (which is not too hard). The motivation and rationale for these conditions will be deferred for another post.

Once you've shown that, it's safe to plug in numbers into $(*)$ and see what you get. Let's try $x = 0$ for fun. Noting that $e_n(0) = 1/\sqrt2$ for all $n$, we get

$$0 = \frac12 + 2\sum_{n \in \mathbb{N}\ \text{odd}} \frac{-2}{n^2\pi^2},$$

which rearranges to $\displaystyle\sum_{n \in \mathbb{N}\ \text{odd}} \frac{1}{n^2} = \frac{\pi^2}{8}$. Wow! We have recovered the Basel sum, $\displaystyle\sum_{n=1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}$ (and if you're not sure how this immediately follows, you should figure it out!).

But wait, there's more to glean from $(*)$! By Parseval's identity, or the fact that the Fourier transform is an isometry, we know that

$$\int_{-1}^1 |f(x)|^2\,dx = \sum_{n \in \mathbb{Z}} |\hat{f}(n)|^2.$$

This gives

$$\frac23 = \frac12 + 2\sum_{n \in \mathbb{N}\ \text{odd}} \frac{8}{n^4\pi^4},$$

which rearranges to $\displaystyle\sum_{n \in \mathbb{N}\ \text{odd}} \frac{1}{n^4} = \frac{\pi^4}{96}$. This recovers the formula

$$\zeta(4) = \sum_{n=1}^\infty \frac{1}{n^4} = \frac{\pi^4}{90}.$$

::: exercise
Let $a \neq 0$ be a real constant. Derive the identity

$$\sum_{n=-\infty}^\infty \frac{1}{a^2 + n^2} = \frac{\pi\coth(\pi a)}{a}$$

by abusing the power of complex numbers.

<details class="spoiler" markdown="1"><summary>Hint 1</summary>

Find the Fourier series of $e^{a|x|}$ over some centered interval, such as $(-1/2, 1/2)$. Don't be afraid to "adjust" $a$ later on if the resulting identities you obtain are not quite what you want. The computation is pretty clean; if you notice the right things, no part of this should be tedious.

</details>

<details class="spoiler" markdown="1"><summary>Hint 2</summary>

You can compute the Fourier coefficients with very little pain by first using symmetry to rid yourself of the pesky absolute value (and, collaterally, eliminate the imaginary part of the frequency). Then, to tame what remains, use a trick/methodology mentioned earlier in this post. (Is there a nice way to find $\displaystyle\int_0^a \cos(bx)e^{cx}\,dx$?)

</details>

<details class="spoiler" markdown="1"><summary>Hint 3</summary>

Once you have reduced the problem to tackling a sum, it is useful to let $E$ be the sum of the even-indexed terms and let $O$ be the sum of the odd-indexed terms. Then your goal is to compute $E + O$ based on a system of equations involving $E$ and $O$.

</details>

<details class="spoiler" markdown="1"><summary>Hint 4</summary>

If you have only one equation, use a clever trick to immediately procure another. This trick is suggested by the form of the final answer. Once you have found a second equation, some slick algebra can give you $E + O$ without actually solving for either $E$ or $O$.

</details>

<details class="spoiler" markdown="1"><summary>Solution</summary>

Following Hint 1, we use a different letter for the constant in the exponent, so let $b \neq 0$ be real (we will set $b = 2\pi a$ at the end), and let $g(x) = e^{b|x|}$ on $(-1/2, 1/2)$, extended to a $1$-periodic function. This extension is continuous (since $g(-1/2) = g(1/2)$) and piecewise smooth, so its Fourier series converges to $g(x)$ at every point. Its coefficients are

$$c_n = \int_{-1/2}^{1/2} e^{b|x|}e^{-2\pi inx}\,dx = 2\int_0^{1/2} e^{bx}\cos(2\pi nx)\,dx,$$

where we used the symmetry of $e^{b|x|}$ to get rid of the absolute value and the imaginary part (Hint 2). To finish the integral, write $e^{bx}\cos(2\pi nx) = \operatorname{Re}\left(e^{(b + 2\pi in)x}\right)$:

$$\begin{aligned}\int_0^{1/2} e^{(b + 2\pi in)x}\,dx &= \frac{e^{(b + 2\pi in)/2} - 1}{b + 2\pi in} \\ &= \frac{(-1)^n e^{b/2} - 1}{b + 2\pi in} \\ &= \frac{\left((-1)^n e^{b/2} - 1\right)(b - 2\pi in)}{b^2 + 4\pi^2n^2}.\end{aligned}$$

Taking the real part,

$$c_n = \frac{2b\left((-1)^n e^{b/2} - 1\right)}{b^2 + 4\pi^2n^2}.$$

Now we plug in numbers to $g(x) = \sum_n c_n e^{2\pi inx}$. Let

$$E = \sum_{n\ \text{even}} \frac{1}{b^2 + 4\pi^2n^2}, \qquad O = \sum_{n\ \text{odd}} \frac{1}{b^2 + 4\pi^2n^2},$$

as in Hint 3 (the sums run over all even or odd integers $n$, positive and negative), so that our goal is $E + O$.

At $x = 0$, we have $g(0) = 1 = \sum_n c_n$, which says

$$1 = 2b\left(e^{b/2}(E - O) - (E + O)\right).$$

That's one equation. For another (Hint 4), plug in $x = 1/2$, where $e^{2\pi in/2} = (-1)^n$ and $g(1/2) = e^{b/2} = \sum_n (-1)^n c_n$:

$$e^{b/2} = 2b\left(e^{b/2}(E + O) - (E - O)\right).$$

Write $S = E + O$ and $D = E - O$. The two equations are

$$1 = 2b\left(e^{b/2}D - S\right), \qquad e^{b/2} = 2b\left(e^{b/2}S - D\right).$$

Multiply the first by $e^{b/2}$ and add it to the second; the $S$ terms cancel:

$$2e^{b/2} = 2bD\left(e^b - 1\right) \quad\Longrightarrow\quad D = \frac{e^{b/2}}{b(e^b - 1)}.$$

Substituting back into the first equation,

$$S = e^{b/2}D - \frac{1}{2b} = \frac{e^b}{b(e^b - 1)} - \frac{1}{2b} = \frac{e^b + 1}{2b(e^b - 1)} = \frac{\coth(b/2)}{2b}.$$

That is, $\displaystyle\sum_{n \in \mathbb{Z}} \frac{1}{b^2 + 4\pi^2n^2} = \frac{\coth(b/2)}{2b}$. Finally, set $b = 2\pi a$:

$$\frac{1}{4\pi^2}\sum_{n \in \mathbb{Z}} \frac{1}{a^2 + n^2} = \frac{\coth(\pi a)}{4\pi a},$$

and multiplying by $4\pi^2$,

$$\sum_{n=-\infty}^\infty \frac{1}{a^2 + n^2} = \frac{\pi\coth(\pi a)}{a}.$$

</details>
:::

### Poisson Summation

Poisson summation is a tool that can be used to tackle sums of the form

$$\sum_{n=-\infty}^\infty f(n),$$

where $f : \mathbb{R} \to \mathbb{R}$ is a continuous function that "decreases rapidly" as $x \to \pm\infty$. For such functions, Poisson summation states that you can replace $f$ with its Fourier transform without changing the value of the sum. That is,

$$\sum_{n=-\infty}^\infty f(n) = \sum_{n=-\infty}^\infty \hat{f}(n).$$

It is normal to feel that this identity is absurd. Two of the proofs I know of include using Fourier series and using contour integration of a cleverly-chosen function.

Poisson summation happens to be an essential tool in analytic number theory, but I am not an expert in this field so I cannot say much on that matter. Amazingly, it is also used crucially for proving optimal results in the study of sphere packings (<https://en.wikipedia.org/wiki/Sphere_packing>), though it should be noted that such applications use the multi-dimensional form

$$\sum_{n \in \mathbb{Z}^d} f(n) = \sum_{n \in \mathbb{Z}^d} \hat{f}(n)$$

or further generalizations.

::: exercise
Use Poisson summation to solve the previous exercise. It is helpful to first prove the identity

$$\int_{-\infty}^\infty \frac{\cos x}{x^2 + a^2}\,dx = \frac{e^{-a}\pi}{a}$$

for $a > 0$, by using contour integration. Or you can just assume it's true if you aren't good at that yet.

<details class="spoiler" markdown="1"><summary>Solution</summary>

*The integral.* Let $a > 0$. Integrate $\dfrac{e^{iz}}{z^2 + a^2}$ over the boundary of the upper half-disk of radius $R > a$. On the big semicircle, $|e^{iz}| \le 1$ and the denominator has size about $R^2$, so that part of the integral is at most about $\pi R \cdot \dfrac{1}{R^2 - a^2} \to 0$. The only pole inside is at $z = ia$, where the residue is $\dfrac{e^{-a}}{2ia}$. By the Residue Theorem,

$$\int_{-\infty}^\infty \frac{e^{ix}}{x^2 + a^2}\,dx = 2\pi i\cdot\frac{e^{-a}}{2ia} = \frac{\pi e^{-a}}{a}.$$

The imaginary part of the left side is the integral of an odd function, so it vanishes, and taking real parts gives the claimed identity.

*The sum.* Take $a > 0$ (the sum is even in $a$, so this is enough) and $f(x) = \dfrac{1}{x^2 + a^2}$, which is continuous and decays quickly enough for Poisson summation. Its Fourier transform is, using that the sine part is odd,

$$\hat{f}(\xi) = \int_{-\infty}^\infty \frac{\cos(2\pi\xi x)}{x^2 + a^2}\,dx.$$

For $\xi \neq 0$, substitute $x = \dfrac{u}{2\pi|\xi|}$:

$$\begin{aligned}\hat{f}(\xi) &= \int_{-\infty}^\infty \frac{\cos u}{\dfrac{u^2}{4\pi^2\xi^2} + a^2}\cdot\frac{du}{2\pi|\xi|} \\ &= 2\pi|\xi|\int_{-\infty}^\infty \frac{\cos u}{u^2 + (2\pi a|\xi|)^2}\,du \\ &= 2\pi|\xi|\cdot\frac{\pi e^{-2\pi a|\xi|}}{2\pi a|\xi|} \\ &= \frac{\pi}{a}e^{-2\pi a|\xi|},\end{aligned}$$

where we applied the identity from the first part with $2\pi a|\xi|$ in place of $a$. This formula also holds at $\xi = 0$, since $\hat{f}(0) = \int \frac{dx}{x^2 + a^2} = \frac{\pi}{a}$. Now Poisson summation says

$$\begin{aligned}\sum_{n \in \mathbb{Z}} \frac{1}{a^2 + n^2} &= \sum_{n \in \mathbb{Z}} \frac{\pi}{a}e^{-2\pi a|n|} \\ &= \frac{\pi}{a}\left(1 + \frac{2e^{-2\pi a}}{1 - e^{-2\pi a}}\right) \\ &= \frac{\pi}{a}\cdot\frac{1 + e^{-2\pi a}}{1 - e^{-2\pi a}} \\ &= \frac{\pi\coth(\pi a)}{a}.\end{aligned}$$

</details>
:::

## 9. The Central Limit Theorem

The **Central Limit Theorem** (CLT) states that with enough data, all distributions are normal (Gaussian) distributions, i.e. look like bell curves. More formally: If $X_n$ is a sequence of independent and identically distributed random variables with mean $\mu$ and variance $\sigma^2$, then

$$\frac{X_1 + \ldots + X_n - n\mu}{\sqrt{n}\,\sigma}$$

converges in distribution to a $N(0, 1)$ random variable. This is a scary fact. But what's even more frightening is that this result can be proven using complex numbers. In fact, it is a very pretty, brief and elegant proof.

The proof uses a probabilistic version of the Fourier transform, called the *characteristic function*: If $X$ is a random variable, we can define its "Fourier transform" $\phi_X : \mathbb{R} \to \mathbb{C}$ via

$$\phi_X(t) := \mathbb{E}e^{itX}.$$

The distribution of a random variable is captured fully by its characteristic function (*this requires proof*), and moreover the characteristic function of a sum of independent random variables turns into a product! This makes the characteristic function a powerful tool for tackling the CLT, which we will now provide (roughly) the proof of.

Assume for simplicity that $\mu = 0$ and $\sigma^2 = 1$. (In fact, this can be assumed WLOG.) Now if $Y_n := \dfrac{X_1 + \ldots + X_n}{\sqrt{n}}$, then

$$\phi_{Y_n}(t) = \mathbb{E}\left[e^{it(X_1 + \ldots + X_n)/\sqrt{n}}\right] = \mathbb{E}\left[e^{itX_1/\sqrt{n}}e^{itX_2/\sqrt{n}}\cdots e^{itX_n/\sqrt{n}}\right].$$

Since the variables are independent, this splits into a product of expectations.

$$= \mathbb{E}e^{itX_1/\sqrt{n}}\,\mathbb{E}e^{itX_2/\sqrt{n}}\cdots\mathbb{E}e^{itX_n/\sqrt{n}}$$

Since the variables have the same distribution, all these expectations are the same.

$$= \left(\mathbb{E}e^{itX_1/\sqrt{n}}\right)^n$$

Now we rewrite $e^{itX_1/\sqrt{n}}$ by Taylor expansion.

$$e^{itX_1/\sqrt{n}} = 1 + \frac{iX_1}{\sqrt{n}}t - \frac{t^2}{2n}X_1^2 + \text{Remainder}$$

The most difficult part of this proof is dealing with the remainder term, and it requires some technical bounds. I will omit these parts of the proof. But intuitively you should know that the remainder term here is on the order of $t^3/n^{3/2}$, in some sense.

Taking the expectation of each side (and using $\mathbb{E}X_1 = 0$, $\mathbb{E}X_1^2 = 1$) now gives

$$\mathbb{E}e^{itX_1/\sqrt{n}} = 1 - \frac{t^2}{2n} + \text{Remainder},$$

and now raising to the $n$th power gives

$$\phi_{Y_n}(t) = \left(\mathbb{E}e^{itX_1/\sqrt{n}}\right)^n = \left(1 - \frac{t^2}{2n} + \text{Remainder}\right)^n.$$

Now, since the remainder term is on the order of like $1/n^{3/2}$, we can consider it asymptotically insignificant compared to the leading term $t^2/(2n)$. Thus, by handwavingly ignoring the remainder, we find that

$$\lim_{n \to \infty} \phi_{Y_n}(t) = \lim_{n \to \infty}\left(1 - \frac{t^2}{2n}\right)^n = e^{-t^2/2}.$$

(Be rest assured that taming the remainder to make this argument rigorous isn't *too* bad to do.) The above limit basically means that $Y_n$ converges in distribution to a random variable whose characteristic function is $e^{-t^2/2}$. It turns out that $e^{-t^2/2}$ is exactly the characteristic function of a standard Gaussian! That's the proof. (...modulo proving all those properties of characteristic functions that we relied on.)

::: exercise
Use complex numbers to show that if $X$ and $Y$ are independent random variables such that $X$ and $X + Y$ have the same distribution, then $Y = 0$ (almost surely).

<details class="spoiler" markdown="1"><summary>Solution</summary>

Since $X$ and $X + Y$ have the same distribution, they have the same characteristic function. By independence, $\phi_{X+Y}(t) = \phi_X(t)\phi_Y(t)$, so

$$\phi_X(t) = \phi_X(t)\,\phi_Y(t) \qquad\text{for all } t.$$

The function $\phi_X$ is continuous with $\phi_X(0) = 1$, so there is a $\delta > 0$ with $\phi_X(t) \neq 0$ for $|t| < \delta$. Dividing by $\phi_X(t)$ gives $\phi_Y(t) = 1$ for all $|t| < \delta$.

Take the real part: $\mathbb{E}\left[1 - \cos(tY)\right] = 0$ for $|t| < \delta$. Since $1 - \cos(tY) \ge 0$, this forces $\cos(tY) = 1$ almost surely, that is, $tY \in 2\pi\mathbb{Z}$ almost surely. Apply this with $t_1 = \delta/2$ and $t_2 = \delta/(2\sqrt2)$. Almost surely there are integers $m, n$ with $Y = \dfrac{2\pi m}{t_1} = \dfrac{2\pi n}{t_2}$, so $m\,t_2 = n\,t_1$. If $n \neq 0$ then $m/n = t_1/t_2 = \sqrt2$, which is impossible for integers, so $n = 0$, hence $m = 0$ and $Y = 0$. $\blacksquare$

</details>
:::

## 10. Fractional derivatives and Sobolev embeddings

First, do note that there are many notions of fractional derivatives, and they are not at all equivalent. It's also not that clear how they are useful. However, it sounds cool.

Complex numbers give one method of defining a notion of fractional differentiation. Let $f(x)$ be a nice function. Then it is well-known that the Fourier transform converts derivatives of $f$ into multiplication by a term:

$$\mathcal{F}(f')(\xi) = -2\pi i\xi\,\hat{f}(\xi)$$

Of course, this works inductively for any number of derivatives.

$$\mathcal{F}(f^{(n)})(\xi) = (-2\pi i\xi)^n\hat{f}(\xi)$$

In particular, we get the identity

$$f^{(n)}(x) = \mathcal{F}^{-1}\left((-2\pi i\xi)^n\hat{f}(\xi)\right),$$

which gives a rather awkward method of taking $n$ derivatives of $f$.

But now this begs the question: What if in the above identity we allow $n$ to be a non-integer? Then this would give a way to *define* a notion of taking $s$ derivatives, where $s$ is any real number.

$$f^{(s)}(x) := \mathcal{F}^{-1}\left((-2\pi i\xi)^s\hat{f}(\xi)\right)$$

This is clearly consistent with "classical" differentiation by definition, so this definition is reasonable provided that $f$ is nice. It should be noted that we should be a wee bit careful with what "$i^s$" means when $s$ is not an integer, but I don't feel like discussing this.

I'm going to use this definition to compute the fractional derivatives of the insultingly simple function $f(x) = 1$. Before you complain, I have very good reason for keeping it simple --- if we try to use the above definition, we immediately run into a problem! Namely, this choice of $f$ does not have a Fourier transform because it does not have sufficient decay at $\pm\infty$.

While this is certainly a major issue, it can be sidestepped with the knowledge that such functions *do* have Fourier transforms, *in the sense of distributions*. As I've previously suggested, this is quite advanced, so it is not easy for me to explain precisely how this works at a low level. Rigorously, we can find that $\hat{f} = \delta_0$ where $\delta_0$ is the Dirac delta at $0$. Now $\mathcal{F}^{-1}((-2\pi i\xi)^s\delta_0)$ is the distribution acting as follows:

$$\langle\mathcal{F}^{-1}((-2\pi i\xi)^s\delta_0), \phi\rangle = \langle(-2\pi i\xi)^s\delta_0, \hat{\phi}\rangle = \langle\delta_0, (-2\pi i\xi)^s\hat{\phi}\rangle$$

Aha! By definition of $\delta_0$, this expression is just $(-2\pi i \cdot 0)^s\hat{\phi}(0)$. If $s > 0$, this is just $0 = \langle 0, \phi\rangle$. If $s = 0$, this is $\hat{\phi}(0)$ (because $0^0 = 1$), which is equal to $\displaystyle\int_{\mathbb{R}}\phi = \langle 1, \phi\rangle$. Thus for $s \ge 0$,

$$f^{(s)}(x) = \begin{cases} 1, & s = 0 \\ 0, & s > 0. \end{cases}$$

The next simplest function we can try differentiating is $f(x) = x$. The first immediate issue is, of course, that $x$ can't be Fourier'd in the usual sense, so we must again interpret distributionally. It's not trivial, but you can show that $\hat{x} = \dfrac{1}{-2\pi i}\delta_0'$ where $\delta_0'$ is the distributional derivative of $\delta_0$. (One way to demonstrate this is to work backwards by proving that

$$\langle\mathcal{F}^{-1}(\delta_0'), \phi\rangle = \langle\delta_0', \hat{\phi}\rangle = \langle\delta_0, -(\hat{\phi})'\rangle = \left.\frac{d}{d\xi}\right|_{\xi=0} -\hat{\phi}(\xi) = \langle x, -2\pi i\phi\rangle.$$

I'm not sure how I'd figure it out more directly.) Now

$$\begin{aligned}\langle x^{(s)}, \phi\rangle &= \langle\mathcal{F}^{-1}((-2\pi i)^{s-1}\xi^s\delta_0'), \phi\rangle \\ &= \langle(-2\pi i)^{s-1}\xi^s\delta_0', \hat{\phi}\rangle \\ &= \langle\delta_0', (-2\pi i)^{s-1}\xi^s\hat{\phi}\rangle \\ &= \left.\frac{d}{d\xi}\right|_{\xi=0} (-2\pi i)^{s-1}\xi^s\hat{\phi}(\xi) \\ &= s(-2\pi i)^{s-1}0^{s-1}\hat{\phi}(0) + (-2\pi i)^{s-1}0^s\hat{\phi}'(0) \\ &= s(-2\pi i)^{s-1}0^{s-1}\langle 1, \phi\rangle + (-2\pi i)^{s-1}0^s\langle -2\pi ix, \phi\rangle \\ &= \langle s(-2\pi i)^{s-1}0^{s-1} + x(-2\pi i)^s 0^s, \phi\rangle.\end{aligned}$$

We conclude that

$$x^{(s)} = s\cdot 0^{s-1} + x\cdot 0^s.$$

Let's check that this is consistent for integer values of $s$. When $s = 0$ (using the convention that $0 \cdot \infty = 0$), this is just $x$. When $s = 1$, this is $1$. When $s \ge 2$, this is $0$. Hence we did not mess up. We can also write this derivative piece-wise in $s$ as

$$x^{(s)} = \begin{cases} x, & s = 0 \\ \text{DNE}, & 0 < s < 1 \\ 1, & s = 1 \\ 0, & s > 1. \end{cases}$$

This procedure can be used to take the (Fourier-wise) fractional derivative of various expressions, but as you can probably tell, computing an exact expression for such derivatives is rather cumbersome in practice. What's far more useful is the consideration of *spaces* of functions for which you can take a fractional derivative, which can pop up in the study of PDE, interpolation theory, and other deep regions of analysis. Of particular interest is the Hilbert space $H^s(\mathbb{R}^d)$ of functions $f \in L^2(\mathbb{R}^d)$ that satisfy

$$\int_{\mathbb{R}^d}(1 + |\xi|^2)^s|\hat{f}(\xi)|^2\,d\xi < \infty,$$

which happens to be equal to the fractional Sobolev space $W^{s,2}(\mathbb{R}^d)$, where $W^{s,p}(\mathbb{R}^d)$ is defined as the space of functions $f \in L^p(\mathbb{R}^d)$ for which

$$\int_{\mathbb{R}^d \times \mathbb{R}^d}\frac{|f(x) - f(y)|^p}{|x - y|^{d + sp}}\,d(x, y) < \infty.$$

For $s$ a positive integer, this in turn is just the Sobolev space of functions which admit $s$ weak derivatives, so these abstractions are certainly grounded in reality (provided you consider weak derivatives to be at all grounded in reality...).

In fact, $f \mapsto \left(\displaystyle\int_{\mathbb{R}^d}(1 + |\xi|^2)^s|\hat{f}(\xi)|^2\,d\xi\right)^{1/2}$ gives an equivalent norm for the topology on $H^s(\mathbb{R}^d)$, which allows some very neat proofs in the realm of Sobolev spaces. A particularly easy result to get is Morrey's Embedding, which states that if $\alpha = s - d/2 \in (0, 1)$ then $H^s(\mathbb{R}^d) \hookrightarrow C^{0,\alpha}(\mathbb{R}^d)$. Equivalently, for any Schwartz function $f \in \mathcal{S}(\mathbb{R}^d)$ we have the bound

$$|f|_{C^{0,\alpha}} \lesssim \|f\|_{H^s}.$$

To show this, first fix $x, y \in \mathbb{R}^d$ and use Fourier inversion to write

$$\begin{aligned}|f(x) - f(y)| &= \left|\int_{\mathbb{R}^d}\hat{f}(\xi)\left(e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right)d\xi\right| \\ &\le \int_{\mathbb{R}^d}|\hat{f}(\xi)|\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|d\xi.\end{aligned}$$

Since we wish to use the funny Fourier norm on $H^s$, we now multiply and divide by the appropriate expression and apply Cauchy-Schwarz.

$$= \int_{\mathbb{R}^d}(1 + |\xi|^2)^{s/2}|\hat{f}(\xi)|\cdot\frac{\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|}{(1 + |\xi|^2)^{s/2}}\,d\xi$$

$$\le \left(\int_{\mathbb{R}^d}(1 + |\xi|^2)^s|\hat{f}(\xi)|^2\,d\xi\right)^{1/2}\left(\int_{\mathbb{R}^d}\frac{\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2}{(1 + |\xi|^2)^s}\,d\xi\right)^{1/2}$$

$$\lesssim \|f\|_{H^s}\left(\int_{\mathbb{R}^d}\frac{\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2}{(1 + |\xi|^2)^s}\,d\xi\right)^{1/2}$$

It remains to prove that $\displaystyle\int_{\mathbb{R}^d}\frac{\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2}{(1 + |\xi|^2)^s}\,d\xi \lesssim |x - y|^{\alpha}$. Since integrals over $\mathbb{R}^d$ are kinda awful, it makes sense to split it as a sum of an integral over $|\xi| < R$ and an integral over $|\xi| > R$, with $R$ to be chosen later. Near $0$ we use the estimate

$$\begin{aligned}\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2 &= \left|e^{2\pi i\xi\cdot(x - y)} - 1\right|^2 \\ &= \left(\cos(2\pi\xi\cdot(x - y)) - 1\right)^2 + \sin^2(2\pi\xi\cdot(x - y)) \\ &\lesssim 1 - \cos(2\pi\xi\cdot(x - y)) \\ &\le 4\pi^2|\xi\cdot(x - y)|^2 \\ &\lesssim |\xi|^2|x - y|^2.\end{aligned}$$

Far from $0$, we use the stupid estimate $\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2 \le 4 \lesssim 1$. Putting this together,

$$\begin{aligned}\int_{\mathbb{R}^d}\frac{\left|e^{2\pi ix\cdot\xi} - e^{2\pi iy\cdot\xi}\right|^2}{(1 + |\xi|^2)^s}\,d\xi &\lesssim \\ &\qquad \int_{\mathbb{R}^d}\frac{1}{(1 + |\xi|^2)^s} \\ &\qquad\qquad\cdot\left(1_{\{|\xi| < R\}}|x - y|^2|\xi|^2 + 1_{\{|\xi| > R\}}\right)d\xi\end{aligned}$$

$$\lesssim \int_{\mathbb{R}^d}\frac{1}{|\xi|^{2s}}\cdot\left(1_{\{|\xi| < R\}}|x - y|^2|\xi|^2 + 1_{\{|\xi| > R\}}\right)d\xi$$

$$\lesssim \int_0^\infty\frac{r^{d-1}}{r^{2s}}\cdot\left(1_{(0,R)}r^2|x - y|^2 + 1_{(R,\infty)}\right)dr$$

$$= |x - y|^2\int_0^R r^{d+1-2s}\,dr + \int_R^\infty r^{d-1-2s}\,dr \lesssim |x - y|^2R^{d+2-2s} + R^{d-2s}.$$

Now we choose $R$, and it makes sense to take $R = |x - y|^{-1}$. This gives the final upper bound (up to a constant) of $|x - y|^{2s-d} = |x - y|^{2\alpha}$, completing the proof.

Actually to really show the desired embedding we should control the $\|\cdot\|_\infty$ norm. I will leave this to you.

::: exercise
Use complex numbers to prove that any $f \in H^s(\mathbb{R}^d)$, where $s > d/2$, is actually bounded with upper bound

$$\|f\|_\infty \lesssim \|f\|_{H^s}$$

(up to a constant depending only on $s$ and $d$).

I must stress that the above statement does not involve complex numbers!

<details class="spoiler" markdown="1"><summary>Solution</summary>

Multiply and divide by $(1 + |\xi|^2)^{s/2}$ and apply Cauchy-Schwarz, exactly as in the Morrey argument:

$$\begin{aligned}\|\hat{f}\|_{L^1} &= \int_{\mathbb{R}^d}(1 + |\xi|^2)^{s/2}|\hat{f}(\xi)|\cdot(1 + |\xi|^2)^{-s/2}\,d\xi \\ &\le \|f\|_{H^s}\left(\int_{\mathbb{R}^d}\frac{d\xi}{(1 + |\xi|^2)^s}\right)^{1/2}.\end{aligned}$$

In polar coordinates the last integral is a constant times $\displaystyle\int_0^\infty\frac{r^{d-1}}{(1 + r^2)^s}\,dr$, which is finite exactly when $2s > d$ (the integrand behaves like $r^{d-1-2s}$ near infinity). So $C_{s,d} := \left(\displaystyle\int_{\mathbb{R}^d}(1 + |\xi|^2)^{-s}\,d\xi\right)^{1/2} < \infty$ depends only on $s$ and $d$, and $\|\hat{f}\|_{L^1} \le C_{s,d}\|f\|_{H^s}$.

Since $\hat{f} \in L^1$, Fourier inversion applies, and for (almost) every $x$,

$$|f(x)| = \left|\int_{\mathbb{R}^d}\hat{f}(\xi)e^{2\pi ix\cdot\xi}\,d\xi\right| \le \|\hat{f}\|_{L^1} \le C_{s,d}\|f\|_{H^s}.$$

Hence $\|f\|_\infty \lesssim \|f\|_{H^s}$. (The same computation shows $f$ agrees almost everywhere with a continuous function, since it is the inverse transform of an $L^1$ function.)

</details>
:::

One last (tough) exercise for you.

::: exercise
Use complex numbers to prove that for any $f, g \in H^s(\mathbb{R}^d)$, where $s > d/2$, we have the inequality

$$\|fg\|_{H^s} \lesssim \|f\|_{H^s}\|g\|_{H^s}.$$

(Hint: You will need to use Young's Convolution Inequality. One form of this inequality is as follows: For $f, g, h : \mathbb{R}^d \to \mathbb{R}$ and $p, q, r \ge 1$ with $\dfrac1p + \dfrac1q + \dfrac1r = 2$, we have

$$\left|\int_{\mathbb{R}^d}\int_{\mathbb{R}^d} f(x)g(x - y)h(y)\,dx\,dy\right| \le \|f\|_{L^p}\|g\|_{L^q}\|h\|_{L^r}.$$

)

<details class="spoiler" markdown="1"><summary>Additional Hint</summary>

Use the bound $(1 + |x|^2)^s \lesssim (1 + |y|^2)^s + (1 + |x - y|^2)^s$.

</details>

<details class="spoiler" markdown="1"><summary>Solution</summary>

The Fourier transform turns products into convolutions: $\widehat{fg} = \hat{f} * \hat{g}$, that is, $\widehat{fg}(\xi) = \displaystyle\int_{\mathbb{R}^d}\hat{f}(\eta)\hat{g}(\xi - \eta)\,d\eta$. So

$$\|fg\|_{H^s} = \left\|(1 + |\xi|^2)^{s/2}\,(\hat{f} * \hat{g})(\xi)\right\|_{L^2_\xi}.$$

By the Additional Hint (applied with $x = \xi$ and $y = \eta$, and then taking square roots),

$$(1 + |\xi|^2)^{s/2} \lesssim (1 + |\eta|^2)^{s/2} + (1 + |\xi - \eta|^2)^{s/2}.$$

Define $F(\xi) = (1 + |\xi|^2)^{s/2}|\hat{f}(\xi)|$ and $G(\xi) = (1 + |\xi|^2)^{s/2}|\hat{g}(\xi)|$, so that $\|F\|_{L^2} = \|f\|_{H^s}$ and $\|G\|_{L^2} = \|g\|_{H^s}$. Then

$$\begin{aligned}(1 + |\xi|^2)^{s/2}\,\left|(\hat{f} * \hat{g})(\xi)\right| &\lesssim \int_{\mathbb{R}^d}\left[(1 + |\eta|^2)^{s/2} + (1 + |\xi - \eta|^2)^{s/2}\right] \\ &\qquad\qquad\cdot|\hat{f}(\eta)||\hat{g}(\xi - \eta)|\,d\eta \\ &= \left(F * |\hat{g}|\right)(\xi) + \left(|\hat{f}| * G\right)(\xi).\end{aligned}$$

We bound the $L^2$ norm of each convolution by testing against $h \in L^2$ with $\|h\|_{L^2} = 1$ and using Young's inequality with $p = 2$, $q = 1$, $r = 2$ (note $\tfrac12 + 1 + \tfrac12 = 2$):

$$\begin{aligned}\left\|F * |\hat{g}|\right\|_{L^2} &= \sup_{\|h\|_2 = 1}\left|\iint F(\eta)|\hat{g}|(\xi - \eta)h(\xi)\,d\eta\,d\xi\right| \\ &\le \|F\|_{L^2}\|\hat{g}\|_{L^1}\|h\|_{L^2} \\ &= \|f\|_{H^s}\|\hat{g}\|_{L^1},\end{aligned}$$

and in the same way $\left\||\hat{f}| * G\right\|_{L^2} \le \|\hat{f}\|_{L^1}\|g\|_{H^s}$. (Reflecting $\hat{g}$, which changes none of its norms, puts these integrals in the exact form of the inequality in the hint.) Finally, since $s > d/2$, the previous exercise's Cauchy-Schwarz estimate gives $\|\hat{f}\|_{L^1} \lesssim \|f\|_{H^s}$ and $\|\hat{g}\|_{L^1} \lesssim \|g\|_{H^s}$. Putting everything together,

$$\|fg\|_{H^s} \lesssim \|f\|_{H^s}\|g\|_{H^s} + \|f\|_{H^s}\|g\|_{H^s} \lesssim \|f\|_{H^s}\|g\|_{H^s}. \qquad\blacksquare$$

</details>
:::

What I have presented here is only those applications that I am most familiar with. There are far more magical uses for complex numbers in "real" settings, many of which are likely unknown to me. What applications do you know of? Feel free to share.
