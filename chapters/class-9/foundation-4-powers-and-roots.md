## Foundation 4: Powers and Roots

Powers and roots appear in number systems, algebra, mensuration and the circle formulas. This lesson repairs the basic index laws and the meaning of a square root before Class 9 extends them.

## 1. Remember the Basics

### What a power means

A power is repeated multiplication:

$$
a^n=\underbrace{a\times a\times\cdots\times a}_{n\text{ factors}}
$$

Here $a$ is the **base** and $n$ is the **index** or **exponent**.

$$
2^4=2\times2\times2\times2=16
$$

Read $2^4$ as "two to the power four". It does **not** mean $2\times4$.

### Squares and cubes

A **square** is a number multiplied by itself:

$$
n^2=n\times n
$$

A **cube** is a number multiplied by itself twice:

$$
n^3=n\times n\times n
$$

| $n$ | $1$ | $2$ | $3$ | $4$ | $5$ | $6$ | $7$ | $8$ | $9$ | $10$ | $11$ | $12$ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $n^2$ | $1$ | $4$ | $9$ | $16$ | $25$ | $36$ | $49$ | $64$ | $81$ | $100$ | $121$ | $144$ |

The numbers $1,4,9,16,25,\ldots$ are **perfect squares**.

### Square roots and cube roots

The square root of a number is the value that, when squared, gives the number:

$$
\sqrt{49}=7\quad\text{because}\quad 7^2=49
$$

The cube root is the value that, when cubed, gives the number:

$$
\sqrt[3]{27}=3\quad\text{because}\quad 3^3=27
$$

> **Note:** In an expression such as $\sqrt{49}$, the symbol means the **principal (non-negative) square root**, so $\sqrt{49}=7$. When solving $x^2=49$, both $x=7$ and $x=-7$ are solutions.

### The laws of exponents

For $a\neq0$ and $b\neq0$:

| Law | Rule |
|---|---|
| Product | $a^m\times a^n=a^{m+n}$ |
| Quotient | $\frac{a^m}{a^n}=a^{m-n}$ |
| Power of a power | $(a^m)^n=a^{mn}$ |
| Power of a product | $(ab)^n=a^nb^n$ |
| Power of a quotient | $\left(\frac{a}{b}\right)^n=\frac{a^n}{b^n}$ |
| Zero index | $a^0=1$ |
| Negative index | $a^{-n}=\frac{1}{a^n}$ |

The condition $a\neq0$ matters for the zero and negative index rules; otherwise the expression would require division by zero.

### Squares roots and factors

A square root can be found by prime factorisation. Group identical prime factors into **pairs** and take one factor from each pair.

$$
\sqrt{324}=18
$$

because

$$
324=(2\times2)\times(3\times3)\times(3\times3)
$$

## 2. Formula Bank

| Idea | Rule |
|---|---|
| Repeated multiplication | $a^n=a\times a\times\cdots\times a$ ($n$ factors) |
| Square | $n^2=n\times n$ |
| Cube | $n^3=n\times n\times n$ |
| Product law | $a^m\times a^n=a^{m+n}$ |
| Quotient law | $\frac{a^m}{a^n}=a^{m-n}$, where $a\neq0$ |
| Power of a power | $(a^m)^n=a^{mn}$ |
| Zero index | $a^0=1$, where $a\neq0$ |
| Negative index | $a^{-n}=\frac{1}{a^n}$, where $a\neq0$ |
| Square root of a product | $\sqrt{ab}=\sqrt{a}\sqrt{b}$ for $a,b\ge0$ |
| Cube root of a product | $\sqrt[3]{ab}=\sqrt[3]{a}\sqrt[3]{b}$ |
| Perfect-square test | All prime exponents are even |

## 3. How to Solve

### Example 1: Use the product law

**Question:** Simplify $2^3\times2^2$.

**Step 1 — Add the indices because the bases are the same.**

$$
2^3\times2^2=2^{3+2}=2^5
$$

**Step 2 — Evaluate if needed.**

$$
2^5=\boxed{32}
$$

### Example 2: Use the quotient law

**Question:** Simplify $\frac{5^6}{5^4}$.

$$
\frac{5^6}{5^4}=5^{6-4}=5^2=\boxed{25}
$$

### Example 3: Power of a power

**Question:** Simplify $(3^2)^3$.

$$
(3^2)^3=3^{2\times3}=3^6=\boxed{729}
$$

### Example 4: Zero and negative indices

**Question:** Evaluate $7^0$ and $2^{-3}$.

$$
7^0=\boxed{1}
$$

$$
2^{-3}=\frac{1}{2^3}=\boxed{\frac{1}{8}}
$$

### Example 5: Square root by prime factorisation

**Question:** Find $\sqrt{576}$.

**Step 1 — Write the prime factorisation.**

$$
576=2^6\times3^2
$$

**Step 2 — Halve each index (take one factor from each pair).**

$$
\sqrt{576}=2^3\times3=8\times3=\boxed{24}
$$

### Example 6: Estimate a square root

**Question:** Between which two whole numbers does $\sqrt{50}$ lie?

**Step 1 — Find nearby perfect squares.**

$$
7^2=49,\qquad 8^2=64
$$

**Step 2 — Since $49<50<64$,**

$$
\boxed{7<\sqrt{50}<8}
$$

It is very close to $7$, because $50$ is just above $49$.

## 4. Watch Out!

| Mistake | Why it is wrong | Correct thinking |
|---|---|---|
| $2^3=6$ | A power is repeated multiplication, not multiplication by the index. | $2^3=8$ |
| $-3^2=9$ | The index applies only to $3$. | $-3^2=-9$, but $(-3)^2=9$ |
| $a^0=0$ | Any non-zero number to the zero power is $1$. | $a^0=1$ for $a\neq0$ |
| $2^{-3}=-8$ | A negative index means a reciprocal, not a negative value. | $2^{-3}=\frac{1}{8}$ |
| $\sqrt{a+b}=\sqrt{a}+\sqrt{b}$ | Roots do not distribute over addition. | Test with $a=9$, $b=16$. |
| $(a^m)^n=a^{m+n}$ | Indices are multiplied for a power of a power. | $(a^m)^n=a^{mn}$ |
| Writing $\sqrt{25}=\pm5$ in a calculation | The root symbol gives the principal root. | $\sqrt{25}=5$; but $x^2=25$ gives $x=\pm5$. |

> **Examination tip:** When a question asks for a simplified power, keep the base and combine the indices. Only evaluate the final number if the question requires it.

## 5. Practise and Check

1. Evaluate $3^4$.
2. Simplify $5^2\times5^3$.
3. Simplify $\frac{7^8}{7^5}$.
4. Simplify $(2^3)^2$.
5. Evaluate $9^0$.
6. Evaluate $3^{-2}$.
7. Find $\sqrt{144}$.
8. Find $\sqrt{196}$.
9. Find $\sqrt[3]{64}$.
10. Find $\sqrt{1296}$ by prime factorisation.
11. Between which two whole numbers does $\sqrt{30}$ lie?
12. Is $180$ a perfect square? Explain using prime factorisation.

**Answers**

1. $81$
2. $5^5=3125$
3. $7^3=343$
4. $2^6=64$
5. $1$
6. $\frac{1}{9}$
7. $12$
8. $14$
9. $4$
10. $1296=2^4\times3^4$, so $\sqrt{1296}=2^2\times3^2=36$.
11. $5<\sqrt{30}<6$, since $25<30<36$.
12. $180=2^2\times3^2\times5$. The exponent of $5$ is odd, so $180$ is not a perfect square.

### Mastery check

She is ready to move on when she can:

- use the product, quotient and power laws without mixing them up;
- explain why $a^0=1$ and $a^{-n}=\frac{1}{a^n}$ need $a\neq0$;
- find a square root by prime factorisation;
- estimate a square root between two whole numbers.
