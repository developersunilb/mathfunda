## Chapter 1 — Orienting Yourself: The Use of Coordinates

> **Why does this matter?**
>
> Imagine you are meeting a friend at a large shopping mall. You tell them, "I'm near the fountain." They still can't find you. But if you say, "I'm at the food court, 20 metres from the escalator, third floor," they find you instantly. Coordinates give us a way to describe **where** something is located, using numbers instead of vague descriptions.

---

## 2. Why Do We Need Coordinates?

Before coordinates, people used landmarks: "the big tree near the well," "three houses past the temple." These descriptions worked locally but failed when the tree was cut down or the temple rebuilt.

Coordinates give us a **standard way to describe location**. Whether you are navigating a city map, designing a circuit board, or programming a video game, coordinates let you describe position precisely.

---

## 3. Discover: The Cartesian Plane

### 3.1 The Idea

René Descartes (1596–1650) realised that any point on a flat surface can be located using **two perpendicular number lines**.

Imagine two number lines crossing at right angles:
- The **horizontal line** is the **x-axis** (positive to the right, negative to the left).
- The **vertical line** is the **y-axis** (positive up, negative down).
- They intersect at the **origin** O(0, 0).

Together, they form the **Cartesian plane** (or coordinate plane).

> **Picture this:** Imagine a grid. The origin O is at the centre. Moving right increases x. Moving up increases y. Every point on the grid has a unique "address" — its coordinates.

### 3.2 Ordered Pairs

Any point P on the plane is represented by an **ordered pair** (x, y):

- **x** (abscissa) = horizontal distance from the y-axis. Positive → right, Negative → left.
- **y** (ordinate) = vertical distance from the x-axis. Positive → up, Negative → down.

> **Key Rule:** The order matters. (3, 2) is different from (2, 3).  
> (x, y) means: *x first (horizontal), then y (vertical).*

**Example:** Plot these points:
- A(3, 2) → 3 right, 2 up
- B(-2, 4) → 2 left, 4 up
- C(-3, -1) → 3 left, 1 down
- D(0, 5) → on the y-axis, 5 units up

---

## 4. Understand: The Four Quadrants

The axes divide the plane into four regions called **quadrants**:

| Quadrant | x | y | Region |
|---|---|---|---|
| I | + | + | Top-right |
| II | - | + | Top-left |
| III | - | - | Bottom-left |
| IV | + | - | Bottom-right |

> **Memory Hook:** Think of the letter **C** — start at the top-right (I) and go counter-clockwise: I → II → III → IV.

---

## 5. Discover: Distance Between Two Points

### 5.1 On the Same Horizontal or Vertical Line

If two points share the same x-coordinate (vertical line) or same y-coordinate (horizontal line), distance is simply the absolute difference of the other coordinate.

> **Example:** Distance between A(3, 2) and B(3, 7)?  
> Same x → vertical distance = |7 - 2| = **5 units**.

> **Example:** Distance between P(-2, 3) and Q(5, 3)?  
> Same y → horizontal distance = |5 - (-2)| = **7 units**.

### 5.2 General Distance Formula

For any two points P(x₁, y₁) and Q(x₂, y₂), the distance PQ is:

$$
PQ = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
$$

**Why does this work?** It comes from the Pythagorean theorem. The horizontal difference and vertical difference form the two legs of a right triangle; the distance PQ is the hypotenuse.

> **Example:** Distance between P(2, 3) and Q(5, 7)?  
> Δx = 5 - 2 = 3, Δy = 7 - 3 = 4  
> Distance = √(3² + 4²) = √(9 + 16) = √25 = **5 units**.

---

## 6. Understand: Midpoint of a Line Segment

### 6.1 The Idea

If you have two points, their midpoint is exactly halfway between them. Think of it as finding the centre of a seesaw that balances perfectly.

### 6.2 The Midpoint Formula

For two points P(x₁, y₁) and Q(x₂, y₂), the midpoint M is:

$$
M\left(\frac{x_1 + x_2}{2},\ \frac{y_1 + y_2}{2}\right)
$$

**Why?** The average of two numbers gives you the number exactly halfway between them. So we average the x-coordinates to get the middle x, and average the y-coordinates to get the middle y.

> **Example:** Midpoint of A(2, 3) and B(8, 7)?  
> x-coordinate: (2 + 8) / 2 = 10 / 2 = 5  
> y-coordinate: (3 + 7) / 2 = 10 / 2 = 5  
> Midpoint = **M(5, 5)**

> **Example:** Midpoint of P(-4, 6) and Q(2, -2)?  
> x-coordinate: (-4 + 2) / 2 = -2 / 2 = -1  
> y-coordinate: (6 + (-2)) / 2 = 4 / 2 = 2  
> Midpoint = **M(-1, 2)**

### 6.3 Watch Out

**Common mistake:** Some students think "add the coordinates" instead of "find their average."  
For example, for points (2, 3) and (6, 9):
- Wrong: (2 + 6, 3 + 9) = (8, 12) — this is a point far away from both!
- Right: ((2 + 6) / 2, (3 + 9) / 2) = (4, 6) — this is exactly halfway between them.

**Remember:** You are looking for the *middle*, not the sum. Always divide by 2.

---

## 7. Worked Examples

### Example 1: Locating a Point

**Problem:** Plot the points A(2, 3), B(-4, 1), C(-3, -2), D(0, -5). Identify the quadrant for each.

**Solution:**
- A(2, 3): x > 0, y > 0 → **Quadrant I**
- B(-4, 1): x < 0, y > 0 → **Quadrant II**
- C(-3, -2): x < 0, y < 0 → **Quadrant III**
- D(0, -5): x = 0, y < 0 → **On the negative y-axis** (not in any quadrant)

---

### Example 2: Distance in Real Life

**Problem:** A drone flies from point A(2, 3) to point B(8, 7). What is the straight-line distance travelled?

**Solution:**
- A(2, 3), B(8, 7)
- Δx = 8 - 2 = 6
- Δy = 7 - 3 = 4
- Distance = √(6² + 4²) = √(36 + 16) = √52 = **2√13 ≈ 7.21 units**

---

### Example 3: Right-Angle Verification

**Problem:** A triangle has vertices A(1, 1), B(4, 1), C(1, 5). Is it a right-angled triangle? How do you know?

**Solution:**
- AB: distance from (1,1) to (4,1) = 4 - 1 = **3 units** (horizontal)
- AC: distance from (1,1) to (1,5) = 5 - 1 = **4 units** (vertical)
- BC: distance from (4,1) to (1,5) = √((4-1)² + (1-5)²) = √(9+16) = **5 units**

Check: AB² + AC² = 3² + 4² = 9 + 16 = 25. BC² = 5² = 25.  
Since AB² + AC² = BC², the converse of the Pythagorean theorem applies — **AB ⟂ AC**, so the triangle is right-angled at A.

---

### Example 4: Collinearity Check

**Problem:** Three points A(2, 3), B(4, 6), C(6, 9) lie on a straight line. Verify this using distances.

**Solution:**
- AB = √((4-2)² + (6-3)²) = √(4+9) = √13
- BC = √((6-4)² + (9-6)²) = √(4+9) = √13
- AC = √((6-2)² + (9-3)²) = √(16+36) = √52 = 2√13

Check: AB + BC = √13 + √13 = 2√13. And AC = √52 = 2√13.  
Since AB + BC = AC, the points lie on a straight line — they are **collinear**.

---

## 8. Guided Practice

### Question 1
In which quadrant does the point P(-5, 4) lie?

<details>
<summary>Click for answer</summary>
Quadrant II (x < 0, y > 0)
</details>

### Question 2
Find the distance between A(1, 2) and B(4, 6).

<details>
<summary>Click for answer</summary>
Δx = 4 - 1 = 3, Δy = 6 - 2 = 4  
Distance = √(3² + 4²) = √(9 + 16) = √25 = **5 units**
</details>

### Question 3
A point lies on the x-axis, 5 units to the left of the origin. What are its coordinates?

<details>
<summary>Click for answer</summary>
(-5, 0) — on the x-axis, y = 0
</details>

### Question 4
Which quadrant has both coordinates negative?

<details>
<summary>Click for answer</summary>
Quadrant III
</details>

---

## 9. Independent Practice

### Question 5
Find the distance between P(1, 2) and Q(4, 6).

### Question 6
Point A is at (3, 5). Point B is 4 units to the right and 2 units down from A. What are the coordinates of B?

### Question 7
A triangle has vertices A(1, 1), B(4, 1), C(1, 5). What type of triangle is it? Find its area.

### Question 8
A drone takes off from point A(0, 0) and flies to B(6, 8). Then it flies to C(6, 2). What is the total distance travelled?

### Question 9
A rectangle has vertices at (2, 1), (2, 6), (7, 6), (7, 1). Find its perimeter and area.

### Question 10
Points A(-3, 2) and B(3, -2) are opposite ends of a diameter of a circle. Find the coordinates of the centre and the radius of the circle.

### Question 11
Three points A(2, 3), B(4, 6), C(6, 9) lie on a straight line. Verify this using distances.

### Question 12
A delivery drone starts at the warehouse W(0, 0). It delivers to A(3, 4), then to B(7, 8), then returns to the warehouse W(0, 0). What is the total distance travelled? (Each grid unit represents 1 kilometre.)

### Question 13
A rectangular park has corners at (-5, -2), (4, -2), (4, 3), (-5, 3). A jogger runs around the boundary twice. What distance does he cover?

### Question 14
A farmer wants to fence a rectangular plot with corners at (2, 3), (2, 7), (8, 7), (8, 3). Find the length of fencing needed.

### Question 15
Two friends live at A(-4, 2) and B(4, 6). They agree to meet at the midpoint of their houses. What are the coordinates of the meeting point?

### Question 16
A rectangular garden has corners at (1, 2), (1, 7), (6, 7), (6, 2). A sprinkler is placed at the centre of the garden. What are its coordinates?

### Question 17
A square has opposite vertices at A(-1, -1) and C(3, 3). Find the coordinates of the other two vertices B and D.

---

## 10. Reasoning & Error Detection

### Question 18
Rohan plots P(3, 4) and Q(3, -2) and says the distance is 1 unit because both x-coordinates are 3. Is he correct? Explain.

<details>
<summary>Click for answer</summary>
**No.** The distance is |4 - (-2)| = 6 units. Rohan confused "same x" with "distance is 1". The vertical distance is |4 - (-2)| = 6 units.
</details>

### Question 19
Priya says the midpoint of A(2, 5) and B(6, 9) is (8, 14) because she added the coordinates. Is she correct? Explain the correct method.

<details>
<summary>Click for answer</summary>
**No.** Midpoint formula: ((x₁+x₂)/2, (y₁+y₂)/2) = ((2+6)/2, (5+9)/2) = (4, 7). Priya added instead of averaging.
</details>

### Question 20
Given points A(2, 3), B(4, 6), C(6, 9). Determine whether these points lie on a straight line (are collinear).

<details>
<summary>Click for answer</summary>
Compute distances:
- AB = √((4-2)² + (6-3)²) = √(4+9) = √13
- BC = √((6-4)² + (9-6)²) = √(4+9) = √13
- AC = √((6-2)² + (9-3)²) = √(16+36) = √52 = 2√13

Check: AB + BC = √13 + √13 = 2√13. And AC = √52 = 2√13.  
Since AB + BC = AC, the points are **collinear**.
</details>

### Question 21
A triangle has vertices A(1, 1), B(4, 1), C(1, 5). Verify whether this is a right-angled triangle.

<details>
<summary>Click for answer</summary>
AB: distance from (1,1) to (4,1) = 3 (horizontal)  
AC: distance from (1,1) to (1,5) = 4 (vertical)  
BC: distance from (4,1) to (1,5) = √((4-1)² + (1-5)²) = √(9+16) = **5 units**

Check: AB² + AC² = 3² + 4² = 9 + 16 = 25. BC² = 5² = 25.  
Since AB² + AC² = BC², the converse of the Pythagorean theorem applies — **AB ⟂ AC**, so the triangle is right-angled at A.
</details>

---

## 11. Real-Life Application

### Question 22
A delivery drone starts at the warehouse W(0, 0). It delivers to A(3, 4), then to B(7, 8), then returns to the warehouse W(0, 0). What is the total distance travelled? *(Each grid unit represents 1 kilometre.)*

<details>
<summary>Click for solution</summary>
- W to A: √(3² + 4²) = 5 km
- A to B: √((7-3)² + (8-4)²) = √(16+16) = 4√2 ≈ 5.66 km
- B to W: √(7² + 8²) = √(49+64) = √113 ≈ 10.63 km
- Total ≈ 5 + 5.66 + 10.63 = **21.29 km**
</details>

### Question 23
A rectangular park has corners at (-5, -2), (4, -2), (4, 3), (-5, 3). A jogger runs around the boundary twice. What distance does he cover?

<details>
<summary>Click for solution</summary>
Length = 4 - (-5) = 9 units. Width = 3 - (-2) = 5 units. Perimeter = 2(9+5) = 28 units. Two rounds = **56 units**.
</details>

---

## 12. Retrieval Practice

### Question 24
Without looking back, write the coordinates of a point in Quadrant III.

<details>
<summary>Example answer</summary>
(-3, -5) — both coordinates negative
</details>

### Question 25
Write the distance formula from memory.

<details>
<summary>Answer</summary>
√((x₂ - x₁)² + (y₂ - y₁)²)
</details>

### Question 26
Complete the table:

| Point | Quadrant |
|---|---|
| (4, -3) | |
| (-2, 5) | |
| (-4, -1) | |
| (0, 7) | |

<details>
<summary>Answer</summary>
| (4, -3) | IV |
| (-2, 5) | II |
| (-4, -1) | III |
| (0, 7) | On y-axis |
</details>

---

## 13. Memory Hooks

> **Memory Hooks:**  
> **x comes before y**, just like in the alphabet.  
> x = horizontal (left/right), y = vertical (up/down).  
> **C** for counter-clockwise quadrants: I → II → III → IV.  
> **Distance formula:** Pythagoras — Δx² + Δy² = d².  
> **Midpoint:** Average the x's, average the y's.

---

## 12. Formula Reference (Formula Vault)

| Formula | When to Use |
|---|---|
| Distance: √((x₂ - x₁)² + (y₂ - y₁)²) | Distance between any two points |
| Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2) | Midpoint of a segment |
| Horizontal distance: |x₂ - x₁| | Points on same horizontal line |
| Vertical distance: |y₂ - y₁| | Points on same vertical line |

> **Formula Vault Link:** For a complete list of coordinate geometry formulas, see the [Formula Vault](../formulas.html).

---

## 14. Answer Key

**Guided Practice:**
1. Quadrant II
2. 5 units
3. (-5, 0)
4. Quadrant III

**Independent Practice:**
5. 5 units
6. B(7, 3)
7. Right triangle (AB ⟂ AC), Area = 6 sq units
8. AB = 10 units, BC = 6 units. Total = 16 units
9. Perimeter = 20 units, Area = 25 sq units
10. Centre = (0, 0), Radius = √13 units
11. Collinear (AB + BC = AC)

**Reasoning & Error Detection:**
18. No. Distance = 6 units.
19. No. Midpoint = (4, 7).
20. Yes, collinear (AB + BC = AC).
21. Yes, right-angled at A (AB² + AC² = BC²).

**Real-Life Application:**
22. Total ≈ 21.29 km
23. Perimeter = 28 units, Two rounds = 56 units

**Retrieval Practice:**
24. (-3, -5) (example)
25. √((x₂-x₁)² + (y₂-y₁)²)
26. (4, -3)→IV, (-2, 5)→II, (-4, -1)→III, (0, 7)→on y-axis

---

## 15. Spaced Retrieval Schedule

**Tomorrow:** Without looking at this chapter, write the distance formula and the midpoint formula from memory.  
**In a week:** Plot the points (2, 3), (-1, 4), (-3, -2), (4, -1) and name their quadrants.  
**In a month:** Explain to a friend why the distance formula works (hint: Pythagoras).

---

*End of Chapter 1. Proceed to Chapter 2: Introduction to Linear Polynomials when ready.*