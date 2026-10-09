---
title: Square Clock
date: 2025-10-16
tags: Math
---

## Problem

Tim has a weird clock; the clock's second hand moves 34 or 47 seconds forward instead of each regular second, at random. As an example, if the clock displays the time as 12:23:05, the following times could be displayed in this order:

$$12{:}23{:}39,\ 12{:}24{:}13,\ 12{:}25{:}00,\ 12{:}25{:}34,\ 12{:}26{:}21,\ \ldots$$

Prove that the clock's second hand would eventually land on a perfect square.

## Solution

<details class="spoiler" markdown="1"><summary>Show solution</summary>

This is a bit of a lazy post as the only clever insight is to see that going forward 47 seconds twice is equivalent to going around 34 seconds once modulo 60 (in the second hand's world).

Due to coprimality of 47 and 60, the 60 numbers $0 \cdot 47$ to $59 \cdot 47$ in modulo 60 will indeed generate all of the numbers 0 to 59. Whenever the hand moves forward, it will move forward by one or two "plus-47" steps.

Consider also in mod 60 that moving 47 seconds forward is identical to moving backward by 13 seconds, so we can observe that the 49-second mark and 36-second mark are consecutive steps in our plus-47 step journey. Since every second hand move will increment by exactly one or two steps at a time, we can never skip both the 49-second and 36-second mark, meaning we will eventually hit one of them, and thus reaching a perfect square is inevitable.

</details>
