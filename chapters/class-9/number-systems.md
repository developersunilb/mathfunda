## 1. Number Systems

Numbers are grouped into sets. Every rational number can be written as a fraction, while an irrational number cannot.

| Type | Description | Examples |
|---|---|---|
| Natural numbers | Counting numbers | $1,\ 2,\ 3,\ \ldots$ |
| Whole numbers | Natural numbers with zero | $0,\ 1,\ 2,\ 3,\ \ldots$ |
| Integers | Whole numbers and their negatives | $-3,\ -1,\ 0,\ 2$ |
| Rational numbers | Can be written as $\frac{p}{q}$, where $q \neq 0$ | $\frac{3}{4},\ -2,\ 0.75$ |
| Irrational numbers | Cannot be written as $\frac{p}{q}$ | $\sqrt{2},\ \pi,\ 0.101001000100001\ldots$ |

> **Remember:** Every integer is rational, but not every rational number is an integer.

The decimal $0.101001000100001\ldots$ is irrational because its pattern is defined but never repeats: after each $1$ there is one more $0$ than before. A decimal is rational only when it terminates or eventually repeats a fixed block of digits.

## 2. Decimal Expansions

A rational number $\frac{p}{q}$ has a terminating decimal only when the denominator is of the form $2^m5^n$ after simplification.

- Terminating: $\frac{7}{8}=0.875$
- Non-terminating and repeating: $\frac{1}{3}=0.333\ldots=0.\overline{3}$
- Non-terminating and non-repeating: $\sqrt{2}=1.414213\ldots$ (irrational)

### Converting a repeating decimal to a fraction

**Example:** Express $0.\overline{6}$ as a fraction.

Let $x=0.\overline{6}$:

$$
10x=6.\overline{6}
$$

Subtract $x$ from $10x$:

$$
9x=6 \quad\Rightarrow\quad x=\frac{6}{9}=\frac{2}{3}
$$

## 3. Operations on Real Numbers

Real numbers are closed under addition, subtraction, multiplication and division (except division by zero).

For positive real numbers $a$ and $b$:

$$
\sqrt{ab}=\sqrt{a}\,\sqrt{b}
\qquad
\sqrt{\frac{a}{b}}=\frac{\sqrt{a}}{\sqrt{b}}
$$

### Radical rules

| Rule | Formula |
|---|---|
| Product of square roots | $\sqrt{a}\times\sqrt{b}=\sqrt{ab}$ |
| Quotient of square roots | $\frac{\sqrt{a}}{\sqrt{b}}=\sqrt{\frac{a}{b}}$ |
| Square root multiplied by itself | $\sqrt{a}\times\sqrt{a}=a$ |
| Square root as a power | $\sqrt{x}=x^{\frac{1}{2}}$ |

Here $a\ge 0$, $b>0$, and $x\ge 0$.

### Rationalisation

To remove a square root from a denominator, the multiplier depends on what the denominator contains.

**Case 1 — a single square root.** Multiply numerator and denominator by that same root:

$$
\frac{1}{\sqrt{2}}=\frac{1}{\sqrt{2}}\times\frac{\sqrt{2}}{\sqrt{2}}=\frac{\sqrt{2}}{2}
$$

**Case 2 — a binomial containing a square root.** Multiply by the conjugate, which has the opposite sign between the terms:

$$
\frac{1}{2+\sqrt{3}}=\frac{1}{2+\sqrt{3}}\times\frac{2-\sqrt{3}}{2-\sqrt{3}}=\frac{2-\sqrt{3}}{4-3}=2-\sqrt{3}
$$

<div class="formula-box">

**Conjugate pair:** $(a+\sqrt{b})$ and $(a-\sqrt{b})$ multiply to give $a^2-b$.

$$
(a+\sqrt{b})(a-\sqrt{b})=a^2-b
$$

</div>

> **Do not multiply by the conjugate automatically.** For a single square root, multiplying by the root itself is simpler and sufficient. Use the conjugate when the denominator is a sum or difference involving a square root.

## 4. Laws of Exponents for Real Numbers

| Rule | Formula |
|---|---|
| Product rule | $a^m \times a^n = a^{m+n}$ |
| Quotient rule | $\frac{a^m}{a^n}=a^{m-n}=\frac{1}{a^{n-m}}$, where $a\neq 0$ |
| Negative exponent | $a^{-n}=\frac{1}{a^n}$, where $a\neq 0$ |
| Zero exponent | $a^0=1$, where $a\neq 0$ |
| Power of a power | $(a^m)^n=a^{mn}$ |
| Power of a product | $(ab)^m=a^m b^m$ or $(x^a)(y^a)=(xy)^a$ |
| Power of a quotient | $\left(\frac{a}{b}\right)^m=\frac{a^m}{b^m}$, where $b\neq 0$ |
| Radical to exponent | $\sqrt[n]{x^m}=x^{\frac{m}{n}}$ |
| Rational exponent | $a^{m/n}=\sqrt[n]{a^m}$ |

<div class="formula-box">

**Remember:** The quotient and negative-exponent rules require a non-zero base.

$$
a^{-n}=\frac{1}{a^n}, \qquad a^0=1 \quad (a\neq 0)
$$

</div>

### Worked example

**Problem:** Simplify $\dfrac{2^5 \times 2^{-3}}{2^2}$.

Use the product and quotient rules:

$$
\frac{2^{5-3}}{2^2}=\frac{2^2}{2^2}=2^{0}=1
$$

## 5. Zero and Infinity

Infinity is written as $\infty$. It is **not an ordinary real number**; it describes a quantity that grows without bound. The statements below are shorthand for limits, not ordinary arithmetic.

### Reciprocals of infinity and zero

| Shorthand | Correct meaning |
|---|---|
| $\frac{1}{\infty}=0$ | As $x\to\infty$, $\frac{1}{x}\to0$. |
| $\frac{1}{0}=\infty$ | $\frac{1}{0}$ is **undefined**. As $x\to0^+$, $\frac{1}{x}\to+\infty$; as $x\to0^-$, $\frac{1}{x}\to-\infty$. |

> **Important:** Division by zero is not allowed in ordinary arithmetic. Writing $\frac{1}{0}=\infty$ is only a limit statement about a denominator approaching zero.

### Arithmetic with infinity

For a constant $K$:

$$
\begin{aligned}
\infty+K&=\infty\\
\infty-K&=\infty\\
\infty\times K&=\infty \quad (K>0)\\
\infty\times K&=-\infty \quad (K<0)\\
\infty+\infty&=\infty\\
\infty\times\infty&=\infty
\end{aligned}
$$

<div class="formula-box">

**Indeterminate forms:** $\infty-\infty$, $0\times\infty$, $\frac{\infty}{\infty}$ and
$\frac{0}{0}$ are not automatically $0$ or $\infty$. Their values depend on the limit
being evaluated. In ordinary arithmetic they are simply **not defined**.

</div>

### What this means in plain language

- $\infty$ is a **direction**, not a place on the number line. There is no largest
  real number, so you can never "reach" infinity.
- $\infty+\infty=\infty$ says that growing without bound twice is still growing
  without bound.
- $\frac{0}{0}$ has no value: any number times $0$ gives $0$, so the answer could be
  anything. That is why it is called *indeterminate* rather than *zero*.
- Do not treat $\infty$ as a number in an ordinary equation. Write a limit, or say
  "undefined", depending on what the question asks.

---

**Practice**

1. Classify $\sqrt{25}$ and $\sqrt{7}$ as rational or irrational.
2. Rationalise the denominator of $\dfrac{3}{2+\sqrt{3}}$.
3. Simplify $\left(5^{1/2}\right)^4$.
4. Explain why $\frac{0}{0}$ is indeterminate but $\frac{0}{5}=0$.
5. Is $\infty$ a real number? Give one reason.

**Answers**

1. $\sqrt{25}=5$ is rational; $\sqrt{7}$ is irrational.
2. $\dfrac{3}{2+\sqrt{3}}=\dfrac{3(2-\sqrt{3})}{4-3}=6-3\sqrt{3}$
3. $\left(5^{1/2}\right)^4=5^2=25$
4. $\frac{0}{5}=0$ because $0=5\times0$. For $\frac{0}{0}$ we would need $0=0\times q$,
   which is true for *every* $q$, so no single value can be chosen.
5. No. Infinity describes unbounded growth; it does not sit at a position on the
   number line.
