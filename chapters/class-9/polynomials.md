## 1. Polynomials

A polynomial in one variable $x$ is an expression of the form

$$
a_nx^n+a_{n-1}x^{n-1}+\cdots+a_1x+a_0
$$

where the exponents are whole numbers and the coefficients are real numbers.

### Degree and types

| Type | Degree | General form | Example |
|---|---|---|---|
| Linear | 1 | $ax+b$ | $2x+5$ |
| Quadratic | 2 | $ax^2+bx+c$ | $x^2-3x+2$ |
| Cubic | 3 | $ax^3+bx^2+cx+d$ | $x^3-1$ |

- A **constant polynomial** has degree $0$.
- The **zero polynomial** is usually not assigned a degree.
- A polynomial with two terms is a **binomial**; with three terms, a **trinomial**.

## 2. Zeroes of a Polynomial

A zero of $p(x)$ is a value $a$ such that $p(a)=0$.

For a linear polynomial $p(x)=ax+b$:

$$
ax+b=0 \quad\Rightarrow\quad x=-\frac{b}{a}
$$

A linear polynomial has exactly one zero. A quadratic polynomial can have two, one or no real zeroes.

### Geometrical meaning

- A linear polynomial represents a straight line. Its zero is the $x$-coordinate where the line meets the $x$-axis.
- A quadratic polynomial represents a parabola. The zeroes are the $x$-coordinates of its intersections with the $x$-axis.

## 3. Remainder Theorem

If a polynomial $p(x)$ is divided by $(x-a)$, then the remainder is $p(a)$.

**Example:** Find the remainder when $p(x)=x^3-2x^2+4$ is divided by $x-2$.

$$
p(2)=2^3-2(2)^2+4=8-8+4=4
$$

The remainder is $4$.

## 4. Factor Theorem

$(x-a)$ is a factor of $p(x)$ if and only if $p(a)=0$.

**Example:** Check whether $x-1$ is a factor of $p(x)=x^3-3x^2+3x-1$.

$$
p(1)=1-3+3-1=0
$$

Since $p(1)=0$, $x-1$ is a factor.

## 5. Algebraic Identities

These general formulae help us expand expressions and factorise them later. They can be read from left to right to expand, or from right to left to factorise.

### 5.1 Squares and products

| Identity | Formula |
|---|---|
| Square of a sum | $(a+b)^2=a^2+2ab+b^2$ |
| Square of a difference | $(a-b)^2=a^2-2ab+b^2$ |
| Difference of two squares | $a^2-b^2=(a+b)(a-b)$ |
| Square difference to product | $(a+b)^2-(a-b)^2=4ab$ |
| Product from square difference | $(a-b)^2=(a+b)^2-4ab$ |
| Sum of squares | $(a+b)^2+(a-b)^2=2(a^2+b^2)$ |
| Sum of squares from a sum | $a^2+b^2=(a+b)^2-2ab$ |
| Shifted square | $(x-y)^2=(x+y)^2-4xy$ |
| Product of two binomials | $(x+a)(x+b)=x^2+(a+b)x+ab$ |

<div class="formula-box">

**Sum of Squares Identity:**

$$
(a+b)^2+(a-b)^2=2(a^2+b^2)
$$

</div>

### 5.2 Cubes and factorisation

| Identity | Formula |
|---|---|
| Cube of a sum | $(a+b)^3=a^3+3a^2b+3ab^2+b^3$ |
| Cube of a sum, grouped | $(a+b)^3=a^3+b^3+3ab(a+b)$ |
| Cube of a difference | $(a-b)^3=a^3-3a^2b+3ab^2-b^3$ |
| Cube of a difference, grouped | $(a-b)^3=a^3-b^3-3ab(a-b)$ |
| Sum of cubes | $a^3+b^3=(a+b)(a^2-ab+b^2)$ |
| Difference of cubes | $a^3-b^3=(a-b)(a^2+ab+b^2)$ |

### 5.3 Three-variable expansions

| Identity | Formula |
|---|---|
| Square of a sum of three terms | $(a+b+c)^2=a^2+b^2+c^2+2ab+2bc+2ca$ |
| Square with one minus sign | $(a+b-c)^2=a^2+b^2+c^2+2ab-2bc-2ca$ |
| Square with another minus sign | $(a-b+c)^2=a^2+b^2+c^2-2ab-2bc+2ca$ |
| Square with two minus signs | $(a-b-c)^2=a^2+b^2+c^2-2ab+2bc-2ca$ |

<div class="formula-box">

**Three-variable product identity:**

$$
(a+b+c)(a^2+b^2+c^2-ab-bc-ca)=a^3+b^3+c^3-3abc
$$

**Useful consequence:** If $a+b+c=0$, then $a^3+b^3+c^3=3abc$.

</div>

### 5.4 Higher-power identity

$$
a^4+b^4=(a^2+b^2)^2-2a^2b^2
$$

### 5.5 Cyclic summation notation

The symbol $\sum$ means "sum". A **cyclic sum** repeats the same pattern by rotating the variables.

| Notation | Expansion for three variables |
|---|---|
| $\sum_{\text{cyc}} a$ | $a+b+c$ |
| $\sum_{\text{cyc}} ab$ | $ab+bc+ca$ |
| $\sum_{\text{cyc}} abc$ | $abc$ |

For four variables $a,b,c,d$, a cyclic triple-product sum has four terms:

$$
\sum_{\text{cyc}} abc=abc+bcd+cda+dab
$$

Cyclic notation is a compact way to write the three-variable identities above. For example:

$$
(a+b+c)^2=a^2+b^2+c^2+2\sum_{\text{cyc}}ab
$$

## 6. Factorisation by Splitting the Middle Term

For $ax^2+bx+c$ with $a\neq0$, find two numbers whose product is $ac$ and whose sum is $b$. Split the middle term using those numbers, then group the four terms in pairs.

**Example 1 (where $a=1$):** Factorise $x^2-7x+12$.

The numbers $-3$ and $-4$ have product $12$ and sum $-7$:

$$
x^2-7x+12=x^2-3x-4x+12
$$

$$
=x(x-3)-4(x-3)=(x-3)(x-4)
$$

**Example 2 (where $a\neq1$):** Factorise $6x^2+11x-35$.

Here $a=6$, $b=11$ and $c=-35$, so $ac=6\times(-35)=-210$. We need two numbers with product $-210$ and sum $11$: they are $21$ and $-10$.

**Step 1 — Split the middle term:**

$$
6x^2+21x-10x-35
$$

**Step 2 — Group in pairs:**

$$
(6x^2+21x)+(-10x-35)
$$

**Step 3 — Factor each pair:**

$$
3x(2x+7)-5(2x+7)
$$

**Step 4 — Take out the common bracket:**

$$
\boxed{(2x+7)(3x-5)}
$$

**Check by expanding:**

$$
(2x+7)(3x-5)=6x^2-10x+21x-35=6x^2+11x-35
$$

<div class="formula-box">

**Why the method works:** Splitting $bx$ into two terms lets us group the expression into two pairs that share a bracket. The shared bracket is then factored out once.

</div>

---

**Practice**

1. Find the zero of $p(x)=4x-9$.
2. Use the remainder theorem for $p(x)=2x^3+x^2-3x+5$ divided by $x+1$.
3. Factorise $6x^2+11x-35$.
