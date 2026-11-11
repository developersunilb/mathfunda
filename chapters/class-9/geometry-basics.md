## 1. Understanding Perimeter and Area

- **Perimeter** is the total distance around the outside of a shape. Think of it as putting up a fence. Add the lengths of all the outer sides.
- **Area** is the total amount of flat space inside a shape. Think of it as painting a wall or laying tiles.

> **Units matter:** Perimeter is measured in ordinary units such as $\text{cm}$ or $\text{m}$. Area is measured in square units such as $\text{cm}^2$ or $\text{m}^2$.

## 2. Comprehensive Shape Formula Table

| Shape | Perimeter | Area | Key variables |
|---|---|---|---|
| **Square**<br>*4 equal sides; all angles $90^\circ$* | $P=4s$ | $A=s^2$ | $s=\text{side}$ |
| **Rectangle**<br>*Opposite sides equal; all angles $90^\circ$* | $P=2(l+w)$ | $A=lw$ | $l=\text{length}$; $w=\text{width}$ |
| **Triangle**<br>*3-sided polygon* | $P=a+b+c$ | $A=\frac{1}{2}bh$ | $a,b,c=\text{sides}$; $b=\text{base}$; $h=\text{height}$ |
| **Circle**<br>*Perfectly round curved shape* | $P=2\pi r$<br>*(circumference)* | $A=\pi r^2$ | $r=\text{radius}$; $\pi\approx\frac{22}{7}$ or $3.14$ |
| **Rhombus**<br>*4 equal sides; opposite sides parallel* | $P=4s$ | $A=\frac{1}{2}d_1d_2$ | $s=\text{side}$; $d_1,d_2=\text{diagonals}$ |
| **Parallelogram**<br>*Opposite sides equal and parallel* | $P=2(a+b)$ | $A=bh$ | $a,b=\text{adjacent sides}$; $b=\text{base}$; $h=\text{height}$ |
| **Trapezium**<br>*(Trapezoid) One pair of parallel sides* | $P=a+b_1+c+b_2$ | $A=\frac{1}{2}(b_1+b_2)h$ | $a,c=\text{slanted sides}$; $b_1,b_2=\text{parallel bases}$; $h=\text{height}$ |

## 3. Heron's Formula: Area from Three Sides

Sometimes the height of a triangle is not given, but all three sides are known. In that case, use **Heron's formula**.

First find the **semiperimeter** $s$, which is half of the perimeter:

$$
s=\frac{a+b+c}{2}
$$

Then the area is:

<div class="formula-box">

$$
A=\sqrt{s(s-a)(s-b)(s-c)}
$$

</div>

Here $a$, $b$, and $c$ are the three sides, and $s$ is the semiperimeter. Do not confuse this $s$ with the side of a square in the formula table.

### Worked example

**Problem:** Find the area of a triangle with sides $5\text{ cm}$, $6\text{ cm}$, and $7\text{ cm}$.

**Step 1 — Find the semiperimeter:**

$$
s=\frac{5+6+7}{2}=\frac{18}{2}=9\text{ cm}
$$

**Step 2 — Substitute into Heron's formula:**

$$
A=\sqrt{9(9-5)(9-6)(9-7)}
$$

$$
A=\sqrt{9\times4\times3\times2}
$$

$$
A=\sqrt{216}
$$

**Step 3 — Simplify the surd:**

$$
A=\sqrt{36\times6}=6\sqrt{6}\text{ cm}^2
$$

**Answer:**

$$
\boxed{A=6\sqrt{6}\text{ cm}^2\approx14.7\text{ cm}^2}
$$

> **When to use which formula:** Use $A=\frac{1}{2}bh$ when the base and perpendicular height are known. Use Heron's formula when only the three sides are known.

## 4. Worked Examples

<div class="formula-box">

### Example 1: Rectangle

**Problem:** A rectangle has length $8\text{ cm}$ and width $5\text{ cm}$. Find its perimeter and area.

$$
P=2(l+w)=2(8+5)=2(13)=\boxed{26\text{ cm}}
$$

$$
A=l\times w=8\times5=\boxed{40\text{ cm}^2}
$$

</div>

<div class="formula-box">

### Example 2: Triangle

**Problem:** A triangle has base $12\text{ cm}$ and vertical height $5\text{ cm}$. Find its area.

$$
A=\frac{1}{2}\times b\times h
$$

$$
A=\frac{1}{2}\times12\times5=\boxed{30\text{ cm}^2}
$$

</div>

<div class="formula-box">

### Example 3: Circle

**Problem:** A circle has radius $7\text{ cm}$. Find its circumference and area using $\pi=\frac{22}{7}$.

$$
P=2\pi r=2\times\frac{22}{7}\times7=\boxed{44\text{ cm}}
$$

$$
A=\pi r^2=\frac{22}{7}\times7\times7=\boxed{154\text{ cm}^2}
$$

</div>

## 5. Common Class 9 Trap Alerts

> ⚠️ **The triangle and parallelogram height trap:** Always use the straight vertical height $h$ that forms a $90^\circ$ right angle with the base. Never use the slanted side length in the area formula.

> ⚠️ **Diameter versus radius:** If a circle problem gives the total width across the circle (diameter $d$), divide it by 2 first:
>
> $$r=\frac{d}{2}$$
>
> Use the radius in $P=2\pi r$ and $A=\pi r^2$.

> ⚠️ **Perimeter unit versus area unit:** Perimeter is one-dimensional (for example, $\text{cm}$). Area is two-dimensional (for example, $\text{cm}^2$). Mixing up the units costs easy marks in CBSE exams.

## 6. Practice

1. Find the perimeter and area of a square of side $9\text{ cm}$.
2. Find the perimeter and area of a rectangle with length $12\text{ cm}$ and width $7\text{ cm}$.
3. Find the area of a triangle with base $15\text{ cm}$ and height $8\text{ cm}$.
4. Find the circumference and area of a circle of radius $14\text{ cm}$. Use $\pi=\frac{22}{7}$.
5. A trapezium has parallel sides $6\text{ cm}$ and $10\text{ cm}$, and height $4\text{ cm}$. Find its area.
6. Use Heron's formula to find the area of a triangle with sides $7\text{ cm}$, $8\text{ cm}$, and $9\text{ cm}$.
