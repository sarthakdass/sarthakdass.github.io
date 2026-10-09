---
title: Amber's Hundred Box Game
date: 2025-10-03
tags: Math
---

## Problem

Amber has a square consisting of $10 \times 10$ square boxes. One at a time, she randomly chooses one of the hundred squares and fills it with a number. The number she puts in a square is always equal to the total number of squares already filled in that square's row and column. In the first square she chooses, she writes a 0, and in the second square she writes a 0 or 1 (depending on whether it is in a different row and a different column or not) etc. So in each square there will be a number from 0 to 18 inclusive. After Amber has written a number in each square, she adds up all of the numbers. What is/are the possible result(s) of this addition?

<details class="spoiler" markdown="1"><summary>Show solution</summary>

## Solution 1 (probably the standard solution)

In each square, write two more numbers: in yellow the total number of squares already filled in the row of that square, and in red the total number of squares already filled in the column of that square. The number Amber writes down is then the yellow number plus the red number. If you look at the yellow numbers per row, you will see that you get the numbers 0 up to 9: the first square chosen gets a 0, the next one a 1, and so on. Similarly, you get the red numbers 0 to 9 per column. So the sum of the yellow numbers in a row (and the red numbers in a column) is:

$$0 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 = 45$$

In total, there are 10 rows and 10 columns. So the total sum is always $20 \cdot 45 = 900$.

## Solution 2 (my solution)

We can imagine this situation a bit differently. We can instead initially assign the value 0 to every single square and give a button to every square. When a button is pressed, the value on that square is fixed and the value of every square within its row and column is increased by 1. If a square has a value $x$, that means that there are $x$ fixed squares in its row and column and if we press its button, it will increase the value by a total amount of $18-x$. We can say a single square's contribution to the total sum is $(18-x) + x = 18$. We can just multiply 18 by 100 and then divide by 2 (as the value of a square is being counted twice via rows and columns). Therefore, the sum will always be 900.

</details>
