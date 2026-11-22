# Chapter 13: Two Variables, One Line

A linear equation in two variables $x$ and $y$ can be written in the standard form

$$
ax+by+c=0
$$

where $a$, $b$ and $c$ are real numbers, and at least one of $a$ or $b$ is not zero.

## 13.1 Linear equations in two variables

### Standard form

The standard form collects every term on one side so the equation reads $ax+by+c=0$. The coefficients carry their signs:

| Equation | Standard form | $a$ | $b$ | $c$ |
|---|---|---|---|---|
| $2x+3y=12$ | $2x+3y-12=0$ | $2$ | $3$ | $-12$ |
| $x-4y=0$ | $x-4y+0=0$ | $1$ | $-4$ | $0$ |
| $y=5$ | $0x+1y-5=0$ | $0$ | $1$ | $-5$ |

The condition “$a$ and $b$ are not both zero” matters. If $a=0$ and $b=0$, the equation becomes $c=0$, which is either always true ($c=0$) or never true ($c\ne0$), and no longer describes a line.

### Why $y=5$ is a valid two-variable equation

$y=5$ can be written as $0x+1y-5=0$. Here $a=0$ and $b=1\ne0$, so the condition is satisfied. The variable $x$ simply does not appear: whatever value $x$ takes, $y$ must be $5$.

## 13.2 Solution of a linear equation in two variables

### What a solution looks like

A solution is an **ordered pair** $(x,y)$ that makes the equation true when substituted.

**Example:** For $2x+3y=12$:

| $x$ | $y$ | Check |
|---|---|---|
| $0$ | $4$ | $2(0)+3(4)=12$ ✓ |
| $3$ | $2$ | $2(3)+3(2)=12$ ✓ |
| $6$ | $0$ | $2(6)+3(0)=12$ ✓ |

Each pair $(0,4)$, $(3,2)$ and $(6,0)$ is a solution.

### Finding solutions by substitution

**Problem:** Find three solutions of $3x+y=9$.

Choose $x=0$:

$$
3(0)+y=9 \quad\Rightarrow\quad y=9
$$

Choose $x=1$:

$$
3(1)+y=9 \quad\Rightarrow\quad y=6
$$

Choose $x=2$:

$$
3(2)+y=9 \quad\Rightarrow\quad y=3
$$

Three solutions are $(0,9)$, $(1,6)$ and $(2,3)$.

### Checking whether a pair is a solution

**Problem:** Is $(2,3)$ a solution of $3x+y=9$?

Substitute $x=2$, $y=3$:

$$
3(2)+3=6+3=9
$$

Both sides agree, so $(2,3)$ is a solution.

**Problem:** Is $(1,5)$ a solution of $3x+y=9$?

$$
3(1)+5=3+5=8\ne9
$$

So $(1,5)$ is not a solution.

### Infinite solutions over the real numbers

Over the real numbers, every valid linear equation in two variables has **infinitely many solutions**:

- If $b\ne0$, any real value of $x$ determines a corresponding value of $y$.
- If $b=0$, then $x=-c/a$, while $y$ can take any real value (a vertical line).

So every valid linear equation in two variables has infinitely many real solutions. There is no single “the” solution — a solution is always an ordered pair $(x,y)$.

> **Domain qualification:** This “infinitely many” statement holds over the real numbers. Over whole numbers or integers, the solution set may be finite, countably infinite, or empty, because not every chosen value yields an allowed pair.

## 13.2.1 Algebraic meaning of solution

Substitution is the test: an ordered pair $(x,y)$ is a solution exactly when replacing $x$ and $y$ in the equation makes both sides equal. There is no unique value to “solve for” — a solution is always a pair.

## 13.2.2 Geometric visualisation of solutions

Plot the solutions of $3x+y=9$ on the coordinate plane:

| $x$ | $0$ | $1$ | $2$ | $3$ |
|---|---|---|---|---|
| $y$ | $9$ | $6$ | $3$ | $0$ |

Plotted points: $(0,9)$, $(1,6)$, $(2,3)$, $(3,0)$. All four satisfy $3x+y=9$.

When you join these points and extend the line in both directions, every point on the line is a solution, and every solution is a point on the line. This is the central idea of the chapter: **an equation, its ordered-pair solutions, and its graph are three ways of describing the same relationship.**

> **Plotting check:** $(0,9)$ lies on the y-axis; $(3,0)$ lies on the x-axis; $(1,6)$ and $(2,3)$ lie on the same straight line through them.

## 13.3 Slope-intercept form of a linear equation

### From standard form to $y=mx+d$

When $b\ne0$, rearrange $ax+by+c=0$:

$$
by=-ax-c \quad\Rightarrow\quad y=\left(-\frac{a}{b}\right)x+\left(-\frac{c}{b}\right)
$$

Write $m=-a/b$ and $d=-c/b$:

$$
y=mx+d
$$

Here $m$ is the **slope** (rise per unit run) and $d$ is the **y-intercept** (where the line crosses the y-axis). We use the letter $d$ for the intercept so it is not confused with coefficient $b$.

**Example:** For $3x+y=9$:

$$
y=-3x+9
$$

So $m=-3$ and $d=9$. The line falls 3 units for every 1 unit right, and crosses the y-axis at $(0,9)$.

### Slope from two points

Given points $(x_1,y_1)$ and $(x_2,y_2)$ with $x_2\ne x_1$:

$$
m=\frac{y_2-y_1}{x_2-x_1}
$$

If $x_2=x_1$, the line is vertical and its slope is undefined.

**Example:** The line through $(0,4)$ and $(4,0)$ has slope

$$
m=\frac{0-4}{4-0}=\frac{-4}{4}=-1
$$

### Horizontal and vertical lines

- $y=d$ is a horizontal line through $(0,d)$, parallel to the x-axis. Slope $m=0$.
- $x=k$ is a vertical line through $(k,0)$, parallel to the y-axis. Slope is undefined (division by zero in rise/run).

For $x=k$ with $k\ne0$, there is no y-intercept. For $x=0$, the line coincides with the y-axis.

### Intercepts

From $y=mx+d$:
- y-intercept: set $x=0$, giving $y=d$. Point $(0,d)$.
- x-intercept: set $y=0$, giving $x=-d/m$ only when $m\ne0$. Point $(-d/m,0)$. If $m=0$ and $d\ne0$, there is no x-intercept; if $m=0$ and $d=0$, the line coincides with the x-axis.

From $ax+by+c=0$:
- y-intercept $d=-c/b$ only when $b\ne0$.
- x-intercept $-c/a$ only when $a\ne0$.

**Example:** Graph of $2x-y=4$:

$$
y=2x-4
$$

Slope $m=2$, y-intercept $d=-4$.

| $x$ | $-1$ | $0$ | $1$ | $2$ |
|---|---|---|---|---|
| $y$ | $-6$ | $-4$ | $-2$ | $0$ |

Plotted points: $(-1,-6)$, $(0,-4)$, $(1,-2)$, $(2,0)$. All four satisfy $2x-y=4$.

> **Plotting check:** $(0,-4)$ is the y-intercept; $(2,0)$ is the x-intercept.

## 13.4 Pair of linear equations in two variables

A **pair of linear equations** involves the same two variables $x$ and $y$ in two equations. A solution to the pair is an ordered pair $(x,y)$ that satisfies both equations at once.

Geometrically, each equation is a line. The solution to the pair is where the two lines meet.

- **One solution:** the lines intersect at a single point.
- **No solution:** the lines are parallel and distinct (never meet).
- **Infinitely many solutions:** the lines coincide (one equation is a non-zero multiple of the other).

**Example:** $x+y=5$ and $x-y=1$.

From the second equation, $x=y+1$. Substitute into the first:

$$
(y+1)+y=5 \quad\Rightarrow\quad 2y=4 \quad\Rightarrow\quad y=2
$$

Then $x=2+1=3$. The pair has the unique solution $(3,2)$, where the two lines cross.

## 13.5 Finding solutions to a pair — algebraic methods

### Substitution method

Isolate one variable in one equation, then substitute it into the other.

**Example:** Solve $x+y=5$ and $x-y=1$.

From $x-y=1$: $x=y+1$.

Substitute into $x+y=5$:

$$
(y+1)+y=5 \quad\Rightarrow\quad 2y=4 \quad\Rightarrow\quad y=2
$$

Then $x=3$. Solution: $(3,2)$.

Check: $3+2=5$ and $3-2=1$. ✓

### Elimination method

Add or subtract the equations to cancel one variable.

**Example:** Solve $2x+3y=13$ and $4x-3y=1$.

Add the equations: the $y$ terms cancel:

$$
(2x+3y)+(4x-3y)=13+1 \quad\Rightarrow\quad 6x=14 \quad\Rightarrow\quad x=\frac73
$$

Substitute back into $2x+3y=13$:

$$
2\left(\frac73\right)+3y=13 \quad\Rightarrow\quad \frac{14}{3}+3y=13
$$

$$
3y=13-\frac{14}{3}=\frac{39-14}{3}=\frac{25}{3} \quad\Rightarrow\quad y=\frac{25}{9}
$$

Solution: $\left(\frac73,\frac{25}{9}\right)$.

Check: $2\cdot\frac73+3\cdot\frac{25}{9}=\frac{14}{3}+\frac{25}{3}=\frac{39}{3}=13$ ✓ and $4\cdot\frac73-3\cdot\frac{25}{9}=\frac{28}{3}-\frac{25}{3}=\frac{3}{3}=1$ ✓.

### When elimination reveals no solution or infinite solutions

**No solution (parallel):** Solve $3x+2y=8$ and $6x+4y=20$.

Multiply the first by 2: $6x+4y=16$. But the second says $6x+4y=20$. Since $16\ne20$, there is a contradiction — the lines are parallel and distinct. No solution.

**Infinite solutions (coincident):** Solve $x+2y=5$ and $2x+4y=10$.

The second equation is exactly 2 times the first. Both describe the same line. Infinitely many solutions.

## 13.6 Graphical method for solving a pair

Graph both lines on the same coordinate plane and read off the intersection.

**Example:** Solve $x+y=6$ and $x-y=2$ by graphing.

Line 1 ($x+y=6$): passes through $(0,6)$ and $(6,0)$.

| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ | $6$ |
|---|---|---|---|---|---|---|---|
| $y$ | $6$ | $5$ | $4$ | $3$ | $2$ | $1$ | $0$ |

Line 2 ($x-y=2$): passes through $(2,0)$ and $(0,-2)$.

| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ |
|---|---|---|---|---|---|
| $y$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |

The lines cross at $(4,2)$, which is on both lines. Check: $4+2=6$ and $4-2=2$. ✓

**Parallel lines (no solution):** $x+y=5$ and $x+y=8$ never meet.
**Coincident lines (infinite solutions):** $x+2y=5$ and $2x+4y=10$ are the same line.

## Nature of solutions and ratio tests

For a pair

$$
a_1x+b_1y+c_1=0,\qquad a_2x+b_2y+c_2=0
$$

compare the ratios:

| Condition | Meaning | Solutions |
|---|---|---|
| $\frac{a_1}{a_2}\ne\frac{b_1}{b_2}$ | Lines intersect at one point | Unique solution |
| $\frac{a_1}{a_2}=\frac{b_1}{b_2}\ne\frac{c_1}{c_2}$ | Parallel distinct lines | No solution |
| $\frac{a_1}{a_2}=\frac{b_1}{b_2}=\frac{c_1}{c_2}$ | Coincident lines | Infinitely many solutions |

The textbook assumes $a_2,b_2,c_2\ne0$ for the ratio test (p. 110–111). If any denominator is zero, use the non-zero-multiple test or elimination instead.

## Applications

### Age problem

**Problem:** The sum of a father’s and his son’s ages is 50. The father is 20 years older than the son. Find their ages.

Let father’s age be $x$ and son’s age be $y$:

$$
x+y=50,\qquad x-y=20
$$

Add: $2x=70\Rightarrow x=35$. Then $y=15$.

Father is 35, son is 15. Check: $35+15=50$ and $35-15=20$. ✓

### Taxi fare (with valid domain)

**Problem:** A taxi charges a ₹50 flag-fall plus ₹12 per km. Write an equation for the cost $C$ for $d$ km, and find the cost for 15 km.

$$
C=50+12d
$$

The valid domain is $d\ge0$ (the flag-fall applies even at zero distance). For $d=15$:

$$
C=50+12(15)=50+180=230
$$

Cost for 15 km is ₹230.

Note: the mathematical y-intercept ₹50 (at $d=0$) is the flag-fall. Since the domain starts at $d\ge0$, the intercept is meaningful: it is the flag-fall charged before the taxi moves.

### Digit reversal

**Problem:** The digits of a two-digit number add to 11. The number is 27 more than its reverse. Find the number.

Let the tens digit be $x$ and the units digit be $y$. The number is $10x+y$ and its reverse is $10y+x$.

$$
x+y=11,\qquad (10x+y)-(10y+x)=27
$$

Simplify the second: $9x-9y=27\Rightarrow x-y=3$.

Solving $x+y=11$ and $x-y=3$: add to get $2x=14\Rightarrow x=7$, then $y=4$.

The number is 74. Check: digits $7+4=11$, reverse is 47, and $74-47=27$. ✓

### Pencils and erasers

**Problem:** 3 pencils and 2 erasers cost ₹14. 2 pencils and 3 erasers cost ₹16. Find the cost of each.

Let pencil cost be $p$ and eraser cost be $e$:

$$
3p+2e=14,\qquad 2p+3e=16
$$

Multiply the first by 3 and the second by 2:

$$
9p+6e=42,\qquad 4p+6e=32
$$

Subtract: $5p=10\Rightarrow p=2$. Then $3(2)+2e=14\Rightarrow 2e=8\Rightarrow e=4$.

A pencil costs ₹2 and an eraser costs ₹4. Check: $3(2)+2(4)=14$ ✓ and $2(2)+3(4)=16$ ✓.

## Misconceptions and error detection

| Misconception | Example error | How to detect and correct |
|---|---|---|
| One solution for two variables | “$2x+3y=12$ has one solution” | Generate a table of several solutions; show the line has infinitely many points |
| Joining only discrete points | Plotting $(0,4),(3,2),(6,0)$ without extending the line | Emphasise the line continues beyond plotted points; every real point on it is a solution |
| Zero vs undefined slope | Saying a vertical line has slope 0 | $m=0$ means horizontal; vertical lines have undefined slope (division by zero) |
| Ratio test with zero denominator | Computing $a_1/a_2$ when $a_2=0$ | Check denominators are non-zero first; otherwise use elimination or the multiple test |
| Sign error in elimination | Adding when terms have the same sign | Add to cancel opposite signs; subtract to cancel same signs |
| Digit-reversal setup | Writing the number as $x+y$ instead of $10x+y$ | Remind: tens digit contributes $10\times$, units digit contributes $1\times$ |
| “Infinitely many” without domain | Claiming infinite solutions over whole numbers | Qualify: infinite over reals; may be finite over whole numbers/integers |

## The three representations of a linear relationship

A linear equation, its ordered-pair solutions, and its graph are three faces of the same object. This exercise asks you to move between all three.

### Forward direction: equation → pairs → line

Start with $x+y=5$.

**Ordered pairs:** Choose values for $x$ and solve for $y$:

| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ |
|---|---|---|---|---|---|---|
| $y$ | $5$ | $4$ | $3$ | $2$ | $1$ | $0$ |

The pairs $(0,5),(1,4),(2,3),(3,2),(4,1),(5,0)$ all satisfy $x+y=5$.

**Geometric line:** Plot these points and join them. They form a straight line sloping downward, crossing the axes at $(0,5)$ and $(5,0)$.

### Reverse direction: graph → equation → pairs

You are shown a straight line passing through $(0,3)$ and $(3,0)$.

**Find the equation:** Slope $m=\frac{0-3}{3-0}=-1$. y-intercept $d=3$. So $y=-x+3$, or $x+y=3$.

**Find ordered pairs:** Any point on the line works. $(0,3)$, $(1,2)$, $(2,1)$, $(3,0)$ — and infinitely many more.

### Why this matters

Moving fluently between equation, pairs, and graph is the conceptual backbone of this chapter. A student who can do all three conversions understands linear relationships; a student who only memorises one procedure does not.

## Practice

Attempt the 15 practice questions on the separate [Practice Questions page](./linear-equations-sample-questions.md). Use a separate sheet for your working, then check against the [Parent Answer Key](./linear-equations-answer-key.md).

---

<small>Chapter aligned to Ganita Manjari Chapter 13, §13.1–13.6. Diagrams are text-based pending the approved inline-SVG rendering spike.</small>
