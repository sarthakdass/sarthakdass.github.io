---
title: What is a Mathematical Object?
date: 2026-08-24
tags: Math
---

Simply put, we define it by its properties.

In elementary school you probably thought of multiplication as repeated addition, which works well for things like $41 \cdot 17$.

But what about $4.1 \cdot 1.7$? Ok, so multiplication is repeated addition, *but* you can also do this weird decimal shifting operation.

Well, what about $3 \cdot 0.333\ldots$? Ok, so multiplication also must have an inverse, so multiplication is repeated addition, *but* you also have to define a bunch of other stuff so that multiplication stays closed in the rationals. Okay: that is still kind of acceptable.

So where the heck is $\sqrt{2} \cdot \sqrt{2}$ supposed to fit in with this model? In fact, what even is $\sqrt{2}$? Once you've properly defined this, any analogy of "if I have 4 rows of 5 apples" has long since flown out the window.

## What is multiplication?

Okay, so it's clearly absurd to continue thinking of multiplication so simplistically. At the same time, "4 rows of 5" is a good analogy to get kids to learn how to multiply; telling them what a [Cauchy sequence](https://en.wikipedia.org/wiki/Cauchy_sequence) is or how you construct the real numbers is kind of silly.

But let's think more abstractly: what is multiplication? In our whole number multiplication example, multiplication is a function that takes two natural numbers to another natural numbers. It also is distributive over another operation called *addition*.

::: definition
A **field** is a set of elements $F$ with two binary operations (i.e. $F \times F \to F$, taking two elements of $F$ to another element of $F$): $+$ and $\cdot$

Addition ($+$) is associative and commutative

Multiplication is distributive and commutative
:::

Also, there is an additive identity $0$ and a multiplicative identity $1$ with $0 \ne 1$, every element has an additive inverse (i.e. $a + (-a) = 0$), and every non-zero element has a multiplicative inverse (i.e. $a \cdot a^{-1} = 1$). But these properties are not too relevant, so we'll gloss over them for the rest of this post.

Looking at this definition, **multiplication is just a binary operator that distributes over addition**.

This still doesn't really answer what multiplication is. OK, multiplication does this distributive thing, but there's no general physical meaning or anything tethering it to reality. All we have are some nice little specific examples that don't really entirely encompass what multiplication is. But that's kind of the point: there's no real answer to what multiplication *is*.

However, you know what multiplication does: it distributes. And sometimes we want to study specific instances of multiplication, like in the rationals or the reals. In these specific cases multiplication will take on more properties, and in some cases (like the rationals) there is an easily understood analogy that almost makes you think, "multiplication is just an extension of this apples analogy".

But ultimately, when you are generally studying multiplication, you are studying *everything with a distributive property*. This makes it easy to apply general results to a specific multiplicative operator, like the multiplicative operator over the rationals or the reals. In general, **when you study things based on their properties, you get the most general results possible**. That's why you should reason about objects based on their properties.

## Another example: Linear Algebra

Unless your first treatment of linear algebra is very theoretical, you will likely be introduced to a vector like this:

::: definition
A vector is a list of elements $\langle v_1, \ldots, v_n \rangle$
:::

This is a great example of how vectors behave: you can visualize the independent components and you have an obvious basis you can work with: the aptly-named **standard basis**. In the 2D plane and 3D space, you even have an obvious physical analogy: unit vectors are literally perpendicular.

But this is just a convenient model for working with vectors. Things like polynomials are vectors too, as well as other things that we may not even be able to explicitly represent. Especially for objects like the latter, how do we reason about them with linear algebra if we **don't even know what they are**?

Well, here's how: you know what they do. Let's look at what a vector really is, or more accurately, what a **vector space** is:

::: definition
A vector space $V$ over a field $F$ is a set of elements with two binary operations:

- Addition: Given two objects $v$ and $w$ in $V$, $v + w$ is also an element in $V$
- Multiplication: Given a scalar $a \in F$ and a vector $v$, $av$ is also an element in $V$
:::

Of course, there are also axioms about associativity, commutativity, distributivity, and identity/inverse elements, just like in a field. If you want the full details, [the Wikipedia page on vector spaces](https://en.wikipedia.org/wiki/Vector_space) should suffice.

Here is the main point: we *expect* vector addition and multiplication to behave in certain ways — many revolving around size or magnitude — because we are used to real numbers or complex numbers. But fields where such notions do not exist can also form vector spaces. Under these fields, we don't really understand what addition or multiplication are. We can't even guarantee that every element in $V$ is in $F_n$, **because we don't need to**. Just because we no longer can "multiply every element $v_i$ by a scalar $a$" explicitly, and just because we don't necessarily know what this multiplication operation is, doesn't mean we still can't reason about it so long as it's distributive (and some other stuff).

Especially because some of the properties of a vector space are so abstract, you can really reason about what a vector space *is*. Sure, there are some good examples like $\R^n$. But in the end those are just illustrative examples.

Let's look at what a linear map is.

::: definition
A linear map satisfies

- $T(u + v) = T(u) + T(v)$
- $T(av) = aT(v)$
:::

Notice how neither of these properties rely on vectors being explicitly representable, say, as a list. We don't actually know what vectors are or what these linear maps are, just how they behave. And yet algebra still works fine even if we don't explicitly write out vectors as $\langle v_1, \ldots, v_n \rangle$ and explicitly write out linear transforms as matrices, because everything still works even if we can't write them out explicitly.

In fact, linear algebra isn't the study of these $\langle v_1, \ldots, v_n \rangle$ things or these weird arrays of numbers. It's not about lists or matrices. At its core, we are studying *every set of objects and functions that satisfies linearity, all at the same time*. We're not studying vectors and linear maps as if they are some concrete thing, but as properties: we are studying objects that behave linearly.

## Conclusion

Multiplication as repeated addition and vectors as lists serve as very good examples for how multiplication and vectors behave. Much would be lost if we stopped using these analogies.

However, much would also be lost if we don't focus on the fundamentals as well. For instance, many linear algebra courses focus so much on the fields $\R$ and $\C$ that we often lose the ability to think abstractly about vector spaces over *all* fields, even when many of the results proved in $\C$ still hold true for any field $F$.

Objects are their properties. That's all they are. Any other descriptor is just a motivational example.

## Addendum

One reason to study vector spaces abstractly is that non-trivial vector spaces can be finite. If you only reason about the fields $\R$ and $\C$, it might be a little difficult to reason about the field $\F_p$ (the field of integers modulo $p$). Yet many results that hold on $\R$ and $\C$ hold true on $\F_p$ and indeed a vector space over any other field.

This is why, whenever possible, we should prove theorems using properties as fundamental as possible. That way, instead of using some cursed characteristic polynomial argument to prove something just for the field $\C$, we can use a more elegant argument to prove it for vector spaces over any field.
