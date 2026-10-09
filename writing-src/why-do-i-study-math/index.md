---
title: Why Do I Study Math?
date: 2026-05-19
tags: Thoughts
---

As I near the end of my undergraduate journey in mathematics and having just come back home from the Math Awards Banquet (which was honestly really sentimental and wonderful!), I wish to fully flush out a response that I am never able to fully provide when someone asks me this question.

But let me justify myself. Why am I writing this?

It turns out this question is really hiding two questions. Why am *I* writing this? And why am I writing *this*? Let me answer these two hand-in-hand.

I am an undergraduate studying mathematics (attach a few asterisks here if you wish). As such, I cannot give you a particularly sophisticated answer of what mathematics is or why it is worth studying. This has a few obvious demerits, but it has a few merits as well. The answer I give will be simple. It will be understandable to a reasonably well-educated layperson. And a high school student, who may have only studied up to calculus and watched a few mathematical videos, can perhaps get a friendlier picture of what they will be studying in college, incomplete as it may be.

Of course, it is no use discussing mathematics without referencing mathematics. So forgive me if I get a little technical. The broad strokes, I hope, will make sense regardless of whether you are familiar with every example I mention.

Now, why am I discussing my philosophy of mathematics? I think it is an appropriate juncture in my life and mathematics career to do so. There are two questions a college student should be able to answer. What am I studying? And why am I studying it? And the latter, again, hides two questions. Why am *I* studying it, and why am I studying *it*?

These are especially hard questions for mathematics majors, because there is not much you can tangibly do with mathematics. Sure, there is applied mathematics, but I feel it is disingenuous to claim that is what I am studying, even if that is what will show up on my diploma. Additionally, applied mathematics does not have what I think makes "mathematics" so charming.

And these are important questions. If you are going to dedicate four years (and potentially more) of your life to studying something, it is quite profitable to know why you are doing it. One, because finding satisfactory answers to these questions genuinely makes you better at math. (At least it has for me.) And two, it is good to confirm that mathematics is the right thing to personally study, and for reasons besides just "I vaguely like mathematics".

Here is my thesis. **In mathematics, everything happens for a principled reason.** Let me give you a few examples of the opposite. High school physics and chemistry labs always annoyed me because there would always be inexplicable "errors" in your measurements. And in fact, half the work in making a state-of-the-art lab is putting herculean amounts of effort to make sure things happen for principled reasons. As another example, take machine learning. Machine learning algorithms succeed and fail for no good reason whatsoever. Certain learning schedules work better than others, and nobody *really* knows why. And this is to say nothing of economics or political science: stocks can rise or fall, and politicians can get elected, and we pretty much have no idea why. Sure, if you consider the universe to be deterministic (an assumption that is already questionable), there is a reason for all of these things. But these are likely not reasons we can understand, let alone good, *principled* reasons.

Mathematics is a fresh of breath air. For instance, if we have a continuous function on a closed interval $[a, b]$, then for every $y$ between $f(a)$ and $f(b)$, there is some $c \in [a, b]$ such that $f(c) = y$. This is the Intermediate Value Theorem, and it is always *exactly* correct. It is not like physics, where you can drop an object from $m$ meters and it takes more than $\sqrt{2m/g}$ seconds to fall to the ground because of a motley variety of reasons. The Intermediate Value Theorem always holds, and if you understand the real numbers, the reason can be explained in less than half a page.

In the physical world, we can calculate the trajectory of an object and be wrong because air resistance suddenly pops up. And even when we account for all these things and things go right, the final explanation can still be a little unsatisfying. "Why do we have to account for air resistance? And friction?" Air resistance and friction are just part of the way this world works, sorry.

Whereas in mathematics, when you are wrong, you are wrong for a principled reason. Perhaps the best example I can offer is Russell's Paradox: there cannot be a set $S$ of sets that do not contain themselves. Regardless of whether $S \in S$ or $S \notin S$, we run into a contradiction. And if we dig a little deeper and ask why we really run into a contradiction and how we can fix it, it turns out that the old notion of a set was too broad. More precisely, we permitted ourselves to create "the set $S$ of all objects satisfying a property $P$". But if we restrict ourselves to "the set $S$ of all objects satisfying a property $P$ that are in set $A$" (which we call **restricted comprehension**), we avoid the issue entirely.

Now why the difference? It is because physics, chemistry, and biology, are constrained by reality. The real world does not care if you would like bowling balls and feathers to fall at the same rate. But for mathematics, you get to decide the rules of the game. If you want bowling balls and feathers to fall at the same rate, you may decree it to be so.

Now the joy in math is that the rules interact in interesting and unexpected (but still principled!) ways. This means, however, that we have to be careful that our rules do not break the game. To vastly oversimplify, suppose I declare that the sky is red and the grass is green. This is fine, because even though they don't respect reality, our rules respect each other. But now suppose I declare the sky is red, the sky is blue, and the grass is green. Now the rules do not respect each other, and our entire game of mathematics is kaput. So, you have to be careful to try and avoid that.

Now, these contradictions can happen in more subtle ways. Maybe you have seen this before:

- The sentence below is true.
- The sentence above is false.

So a priori, you should believe that it is hard to tell whether a set of mathematical rules (which we call a **theory**) is consistent. That is, it is hard to check whether a theory has no contradictions.

How hard? I have bad news for you: it is impossible. This is **Godel's Second Incompleteness Theorem**: very informally, for *any* sufficiently strong theory of mathematics, we cannot use said theory to show that it is self-consistent. What do we mean by sufficiently strong? It turns out that if you can use the theory to perform arithmetic, it is already too strong.

So, mathematics is a little nuanced. We cannot truly have everything happen for fully principled reasons, because we don't even know if our theory of mathematics is consistent. So the best we can do is believe and hope that our theories are reasonable and our logic is principled.

Now, there are good reasons to believe that mathematics behaves in a principled manner in the end. If you wish, you may close the book here and never think about it again. But we will explore the rabbit hole. Why ought we believe that mathematical reasoning is principled? Put another way, do we have a principled reason to believe that mathematical reasoning is principled?

We ought to first define what "mathematical reasoning" is. This is done formally in a subfield of mathematics known as **mathematical logic**. Here is an informal picture of a part of it known as **model theory**. You may picture that mathematics is a game specified by a series of rules. For example, if the game is Euclidean geometry, the rules are Euclid's axioms. And the rules of the game may change. For instance, we may modify the parallel postulate to get elliptical geometry. And if our game is mathematics, we usually use a formal set theory known as **ZFC set theory** for our rules. But this picture is still incomplete.

Let me tell you something a little surprising. Under our standard model of mathematics, i.e. ZFC, we do not know whether there is a set $S$ such that $|\mathbb{N}| < |S| < |\mathbb{R}|$. In other words, we do not know if there is a set whose size is strictly between that of the naturals and the reals. Moreover, we know that we do not know. More accurately, it could go either way: we could have such an $S$ exist, and we could also have no such $S$ exist. The question whether such an $S$ exists is known as the **continuum hypothesis**.

Now what do I mean "it could go either way"? Yes, we may change the rules of mathematics. But once we've laid them down, assuming they are consistent, surely every statement is either true or false? But this is not the case. There are **models** of ZFC where the continuum hypothesis is true and models where it is false.

As an analogy, suppose I defined a dog for you. It has four legs, it walks, it wags its tail. You may derive that a dog also barks. But if you asked me, "must a dog be brown?" my answer would be no. There are dogs that are not brown. Now suppose you asked me "must a dog be not brown?" and my answer would still be no. There are brown dogs too.

The fact of the matter is a **theory** (i.e. a set of rules) is not associated with just *one* **model** (a "game"). Rather, a theory is associated with many models. Given a set of rules, there are many games that follow these rules. And when we are studying "normal" mathematics under ZFC, we are studying a bunch of games at the same time and figuring out, "what must be true of *all* these games?" After all, mathematical objects are their properties. And if we rightfully consider "mathematics" itself as a mathematical object, mathematics is just its properties: the rules of ZFC. Just as it would be silly to consider linear algebra the study of a particular vector space, it would be silly to consider mathematics the study of a particular model of ZFC.

So why do we take ZFC as our foundation? Because even if there is "undefined behavior" (as there must be, by Godel's First Incompleteness Theorem), we can make enough deductions in ZFC to carry out standard mathematics. And on the flipside, there is not "too much". The axioms of ZFC have been proven to be independent, and if we were to remove any of them, we would lose the ability to do a lot of useful mathematics. So to answer the original question, we are reasonably sure that ZFC is a principled enough foundation.

Mathematics is not absolute. It is as relative as can be. And this makes it tempting to despair that all this foundational stuff is pointless. Why bother studying ZFC if, in the best case, it is consistent and we never know? Why study a particular set of logical rules? In other words, is there a principled reason to study any particular theory of mathematics over another? If we answer this question, we also figure out why we should care about mathematics as a whole, which is totally divorced from our conversation on foundations. Two birds with one stone.

There are a few mathematical ideas that we can take for granted are worth studying. For one, the natural numbers along with the operations $(+, \times)$ are self-evidently important. And it is not hard to see how we get $\mathbb{Q}$ from it. The general idea of sets (collections of objects) and functions (machines that take in objects and spit out objects) naturally lead to set theory, and so on. The areas of math we study are those that naturally build up from these "fundamental" mathematical objects.

But what makes a fundamental mathematical object fundamental? In my eyes, there are two criteria: it has to be an abstraction of something humanity naturally uses, and it has to lead to interesting consequences in mathematics for principled reasons.

The natural numbers are a perfect example. Counting is something people have been doing since the dawn of humanity, and the theory of natural numbers (aptly called "number theory") is very rich. Now, both of these criteria have to be present. Differential equations very neatly describe time-dependent processes, yet the thing is differential equations happen for nebulous rather than principled reasons. So despite its usefulness, it is not the kind of mathematics I necessarily find enjoyable to study. And logic puzzles are enjoyable precisely because every implication happens for a principled reason. Yet they could hardly be described as "an abstraction of something humanity naturally uses", so they are not the kind of mathematics I am thinking about here.

Now I want to unpack the phrase "interesting consequences in mathematics". If we restrict the word *mathematics* to mean "the mathematics I personally find worth studying", then this is completely self-referential. There is no need to fret, however. Just as Google PageRank figures out which webpages are important by looking at their relative importance to each other, we can figure out which objects of mathematics are fundamental the same way. So long as we believe that "a field of natural abstractions with interesting, principled connections to each other" is a field worth studying, then it does not matter that our justification for studying each individual abstraction is only that "they connect to the other abstractions". It is not that any particular object makes mathematics worth studying; it is the *connections*, the *principled structure* that makes it worthwhile.

So why is mathematics so charming, and what is it really? I'm afraid I can only give you my personal answer. For me, the charm of mathematics is that everything happens for a principled reason. But you don't get the nice things in life for free. So, just as much as mathematics is about discovering these principled lines of reasoning, it is also about finding which rules make our reasoning principled. And about constructing objects that give us more sophisticated and useful lines of reasoning.

When you are studying mathematics, you are not just playing a game. You are asking "What makes this game tick? And how can I make it better?"
