---
title: Framework
date: 2026-06-16
tags: Thoughts
---

There's an implicit misconception that learning is about facts. To be sure, if you surveyed every student and teacher in the nation, not one of them would disagree that there are things besides the facts that matter. But mighty few apply these principles, especially when it matters the most.

Educators are aware of this on some level. They ask themselves, "how can we focus on what's important instead of the facts?" That's where all the post-modern math curriculums come from. But none of them have bothered to ask, "what's important?"

## Value

For the sake of argument, let's say that classes consist primarily of the content you are taught. If you think about this carefully, it's a dark view of education. It implies that your value, as a teacher or a student, is based on how much you know.

This is why some K-12 teachers feel threatened when they're no longer the smartest in the room. And this happens most commonly to K-12 math teachers, which is why some math classes are so awful. This is also why some students feel so defeatist about their academic prospects. When intelligence is based on something that can be reasonably quantified, comparison is inevitable.

It also says that teachers have minimal value. If class is based on being a convenient (and mandatory) repository of information, then it's by far not the best at its job. Google has far more comprehensive resources. Why not just use it instead? Why bother sending kids to school for six hours when they can just search up the War of 1812, instead of learning about it in class?

You might protest this evaluation of education, and rightly so. Teachers aren't just lookup tables. Their classes are helpful because of the teacher's expertise, because they are coherent, and because they are complete.

Expertise really means correctness. Teachers are helpful because they are a guarantee that everything we learn is correct. Books have typos, video lectures have mistakes, and teachers have the ability to give context and correct any misconceptions. So let's change the nebulous "expertise" to a more concrete "correctness," which gives us a nice alliterative list: *correct, coherent, complete*.

Facts are not the main purpose of a class. In fact, I would say that facts are wholly unimportant on their own. The only reason classes ought to teach facts is to construct a *framework* of the subject.

Why is a framework so important? Because expertise is the ability to deal with unknown situations. No matter what profession you're going in, it's impossible to know all the facts. You'll always have to handle new information. A framework is just a set of tools that helps you handle it.

With this in mind, coherence and completeness make a lot more sense. It just means your framework needs to be internally consistent, and it should be flexible enough to encompass all of the facts.

## Principles

The framework should be the guiding principle when teaching and learning. Good frameworks need to be correct, coherent, and complete. But there's a fourth principle, and it's especially important when teaching and learning: *conciseness*.

Much like how good writing should contain as few words as possible, a framework should be presented with as few ideas as possible. In other words, a framework should aim to be minimalistic.

It seems like this principle conflicts with completeness. But these principles don't have the same priority. This is not a hard rule, but I personally think that from most to least important, it is correctness, coherence, completeness, and conciseness. This is because I think an incorrect framework is more harmful than an incoherent framework, and so on.

Minimalism does not mean omitting useful information. It means including only what is useful, and aggressively cutting the rest.

Unless you're in writing, the arts, or programming, the principle of conciseness won't make sense at first. But the purpose of a framework is to be flexible. Extra baggage undermines this. It distracts from the core of the framework.

A concrete example can be found in Precalculus, where teachers force students to mark the cosine and sine for each angle that is a multiple of $\pi/4$ or $\pi/6$. To show why this is unnecessary, let's go over a good framework of trigonometry.

First, there is the concept of polar coordinates. You can represent a point on the plane in two ways: you can either use the $x$ and $y$ coordinates, or you can describe the distance from the origin and the angle. The latter is polar coordinates. **All trigonometric functions represent is a way to convert from polar coordinates to rectangular.** We need a way to arbitrarily represent the $x$ and $y$ coordinates of the point $(1, \theta)$ (which is written in polar coordinates). And *by definition*, this point is $(\cos\theta, \sin\theta)$.

Perhaps a teacher might also want to correct the misconception that sine comes before cosine. Because the $x$ coordinate comes before the $y$ coordinate, so too should cosine come "before" sine. This would create the coherence necessary for a good framework.

And this framework is flexible. You can easily understand that $\tan\theta$ represents the slope of the line joining the origin and $(1, \theta)$ once you've accepted the polar definition of cosine and sine.

Trigonometry need not be complicated. This explanation only took a couple of paragraphs. Yet students walk away without a solid understanding of cosine or sine because they were forced to label points on the unit circle. A lack of conciseness actively inhibits understanding.

This case is a little more nuanced than I'm letting on. I think that marking points on the unit circle is perfectly fine, as an exercise. But care must be taken to ensure that students do not mistakenly believe that the "unit circle" is part of the framework they are learning about. It is just an exercise to reinforce their understanding.

Communicating information about a framework is hard. But I think it helps to explicitly use this idea of a framework. When you're trying to explain a concept, explain how it fits into the framework you're constructing, and explain how your framework follows the four principles.

As a meta-example, let's apply these principles to this framework itself.

- It is correct. No one would contest that a framework should be correct, coherent, complete, and concise. Nor would anyone contest that these principles may come into conflict.
- It is coherent. Pieces make sense with respect to each other and the whole.

  It makes sense that principles are prioritized differently. That's how you resolve conflicts between them.

  And each individual ordering makes sense. [^1] Correctness is more important than coherence because it's harmful to ignore facts when they don't fit your theories. Cohesion is more important than completeness because you don't want to cover everything *at the cost of confusing your students*. [^2] And completeness is more important than minimalism because you need to deal with common situations, at the least.

  Everything in this framework of frameworks follows logically. The pieces fit together like this because *they can't help themselves*. Everything I say about frameworks is unavoidable. If you start with the same core principles, eventually you will end up with similar conclusions. [^3]

  I think that people are most in danger of breaking coherence. They *know* that correctness is crucial, even if some of them can't follow the principle. But few people think that coherence is important.

  This is especially bad in education, because we tend to blame the teacher for correctness, and we blame the *student* for coherence.
- It is complete. These four principles are enough to produce a good framework. Each subject will have its own nuances and special considerations, but any sufficiently intelligent student or teacher could figure the rest out on their own.
- It is concise. Every principle is necessary. There's nothing you can take away without the entire idea collapsing.

## Reconcile

Cohesion is probably the most difficult principle to follow properly. At least with the other three, you can either think of a specific example of the principle being followed or you can understand the consequences of breaking it. But coherence is nebulous.

Another way you can think of coherence is reconciliation. Good explanations reconcile two ideas that, on their faces, do not seem related.

Take factoring a quadratic, for instance. There are two ways you can express a quadratic: [^4]

- in "standard" form: $x^2 + bx + c$
- or in "factored" form: $(x - p)(x - q)$

These forms seem totally unrelated. But here's the key idea: **you can represent the same quadratic with each form**. Because you're representing the quadratic in the same way, the quadratics have to be equal. Thus, you get

$$
x^2 + bx + c = x^2 + (-p - q)x + pq
$$

and by coefficient matching, $b = -(p + q)$ and $c = pq$.

This framework is powerful. It will lead you to realize Vieta's Formulas, and it might even happen by accident. Cohesive frameworks provide more for less: there are no diamond or box methods you have to remember, but you understand more once you realize everything's connected.

There are plenty of other examples. Take Taylor Series, for instance. You can find the $n$th derivative by differentiating $n$ times or by looking at an $n$th degree approximation of the function at that point. These definitions have to agree, since they're defining the same thing. With the Power Law, you see that some fudging of constants has to happen in order to make the definitions consistent. **That's where the factorials in the denominator come from: the Power Law.**

Cohesion is just reconciliation on a bigger scale. Where you have to make two ideas fit together with reconciliation, you have to make *all* the ideas fit together with coherence.

This is why you teach "hard" trigonometry (angle addition, et cetera) along with complex numbers. These concepts are identical, and once you can grasp that, both of them will be much easier to remember and use.

Frameworks aren't a new or theoretical idea. People are actively applying them. In a sense, this essay is just a framework itself: a framework about frameworks.

[^1]: The approach I take to explain these orderings is proof by contradiction. It's hard to say exactly why one principle is more beneficial than another. But it is very easy to give examples when breaking one principle is more harmful than breaking another.

[^2]: Failing to prioritize coherence over completeness leads to *checkbox learning*, when the main goal is to get through a series of topics, rather than learning.

[^3]: This is how so many people can independently discover the same idea at the same time in math. Everyone's working with the same principles, and the principles are very intuitive.

[^4]: I don't consider the leading coefficient because that violates the principle of minimalism. Once you know how to factor a monic quadratic, non-monic quadratics become easy to handle. Including the leading coefficient in the framework of factoring is just distracting.
