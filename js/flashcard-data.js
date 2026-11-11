/**
 * Curated recall decks. Every card is drawn from the formula banks and method
 * notes in the chapters, so the wording matches the lessons.
 *
 * Fronts are prompts, not labels: the aim is to force retrieval, not recognition.
 */

const tex = String.raw;

const DECKS = [
  {
    id: "f1-numbers",
    title: "Numbers and Signs",
    subtitle: "Integers, absolute value and sign rules",
    stage: "foundations",
    chapter: "foundation-1-numbers-and-signs",
    cards: [
      {
        front: "What is the absolute value of −7?",
        back: tex`$|-7| = 7$. Absolute value is the distance from zero, so it is never negative.`,
      },
      {
        front: "Simplify: $-3 + (-5)$",
        back: tex`$-8$. Same signs: add the sizes and keep the common sign.`,
        hint: "Same signs add.",
      },
      {
        front: "Rewrite without brackets: $a - (-b)$",
        back: tex`$a + b$. Subtracting a negative is the same as adding.`,
      },
      {
        front: "What is $(-4)\times(-6)$?",
        back: tex`$24$. Same signs give a positive result.`,
      },
      {
        front: "Compare $(-3)^2$ and $-3^2$.",
        back: tex`$(-3)^2 = 9$ but $-3^2 = -(3^2) = -9$. The bracket decides what is squared.`,
      },
      {
        front: "What is $0 \div 5$, and what is $5 \div 0$?",
        back: tex`$0 \div 5 = 0$, because zero shared into 5 groups is zero. $5 \div 0$ is undefined.`,
      },
      {
        front: "State the division algorithm and its condition on the remainder.",
        back: tex`$\text{dividend} = \text{divisor}\times\text{quotient} + \text{remainder}$, with $0 \le \text{remainder} < \text{divisor}$.`,
      },
      {
        front: "What is the opposite of $-x$?",
        back: tex`$x$. Opposites are the same distance from zero on the other side.`,
      },
    ],
  },
  {
    id: "f2-fractions",
    title: "Fractions, Decimals and Percentages",
    subtitle: "Three forms of the same number",
    stage: "foundations",
    chapter: "foundation-2-fractions-decimals-percentages",
    cards: [
      {
        front: "When are two fractions $\\frac{a}{b}$ and $\\frac{ak}{bk}$ equal?",
        back: tex`Always, provided $k \ne 0$. Multiplying top and bottom by the same number does not change the value.`,
      },
      {
        front: "How do you add $\\frac{a}{b} + \\frac{c}{d}$?",
        back: tex`$\frac{a}{b}+\frac{c}{d}=\frac{ad+bc}{bd}$. Make the denominators equal first.`,
      },
      {
        front: "How do you divide by a fraction?",
        back: tex`$\frac{a}{b}\div\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}$, where $c\ne0$. Multiply by the reciprocal.`,
      },
      {
        front: "Change $2\\frac{3}{4}$ to an improper fraction.",
        back: tex`$2\frac{3}{4}=\frac{2\times4+3}{4}=\frac{11}{4}$.`,
      },
      {
        front: "How do you compare $\\frac{a}{b}$ and $\\frac{c}{d}$ quickly?",
        back: tex`Cross-multiply: $\frac{a}{b}>\frac{c}{d}$ when $ad>bc$, for positive denominators.`,
      },
      {
        front: "Convert $0.375$ to a fraction in simplest form.",
        back: tex`$0.375=\frac{375}{1000}=\frac{3}{8}$.`,
      },
      {
        front: "Convert a decimal to a percentage.",
        back: tex`Multiply by $100$. For example $0.62 = 62\%$.`,
      },
      {
        front: "Convert a percentage to a decimal.",
        back: tex`Divide by $100$. For example $15\% = 0.15$.`,
      },
      {
        front: "How do you find $p\\%$ of a quantity?",
        back: tex`$\frac{p}{100}\times\text{quantity}$.`,
      },
      {
        front: "State the percentage change formula.",
        back: tex`$\frac{\text{change}}{\text{original}}\times100\%$. Always divide by the original value.`,
      },
      {
        front: "How do you find the HCF and LCM from prime factors?",
        back: "HCF: the lowest common power of each prime. LCM: the highest common power of each prime.",
      },
      {
        front: "How do you simplify a fraction?",
        back: "Divide the numerator and denominator by their highest common factor (HCF).",
      },
    ],
  },
  {
    id: "f3-ratio",
    title: "Ratio and Proportion",
    subtitle: "Comparing, sharing and scaling",
    stage: "foundations",
    chapter: "foundation-3-ratio-and-proportion",
    cards: [
      {
        front: "Write the ratio $a:b$ as a fraction.",
        back: tex`$a:b=\frac{a}{b}$, where $b\ne0$.`,
      },
      {
        front: "When is $a:b$ proportional to $c:d$?",
        back: tex`$a:b=c:d \iff ad=bc$. The cross-products are equal.`,
      },
      {
        front: "Write the equation for direct proportion.",
        back: tex`$\frac{y_1}{x_1}=\frac{y_2}{x_2}$. Both quantities grow together.`,
      },
      {
        front: "Write the equation for inverse proportion.",
        back: tex`$x_1y_1=x_2y_2$. As one grows, the other shrinks; the product stays fixed.`,
      },
      {
        front: "How do you share a total in the ratio $a:b:c$?",
        back: tex`One part $=\frac{\text{total}}{a+b+c}$, then multiply that part by each ratio number.`,
      },
      {
        front: "State the unitary method in one line.",
        back: tex`Value of one unit $=\frac{\text{total value}}{\text{number of units}}$, then multiply for the required number of units.`,
      },
      {
        front: "How is a scale written as a ratio?",
        back: tex`$\text{scale}=\frac{\text{drawing length}}{\text{actual length}}$. Both lengths must use the same unit.`,
      },
      {
        front: "A recipe for 4 people uses 300 g rice. How much for 10 people?",
        back: tex`Direct proportion: $\frac{300}{4}=75$ g per person, so $75\times10=750$ g.`,
      },
    ],
  },
  {
    id: "f4-powers",
    title: "Powers and Roots",
    subtitle: "Index laws and perfect powers",
    stage: "foundations",
    chapter: "foundation-4-powers-and-roots",
    cards: [
      {
        front: "State the product law of indices.",
        back: tex`$a^m\times a^n=a^{m+n}$.`,
      },
      {
        front: "State the quotient law of indices.",
        back: tex`$\frac{a^m}{a^n}=a^{m-n}$, where $a\ne0$.`,
      },
      {
        front: "Simplify $(a^m)^n$.",
        back: tex`$(a^m)^n=a^{mn}$. A power of a power multiplies the indices.`,
      },
      {
        front: "What is $a^0$ for $a\\ne0$?",
        back: tex`$a^0=1$.`,
      },
      {
        front: "Rewrite $a^{-n}$ without a negative index.",
        back: tex`$a^{-n}=\frac{1}{a^n}$, where $a\ne0$.`,
      },
      {
        front: "Simplify $\\sqrt{ab}$ for $a,b\\ge0$.",
        back: tex`$\sqrt{ab}=\sqrt{a}\,\sqrt{b}$.`,
      },
      {
        front: "How can you tell whether a number is a perfect square from its prime factors?",
        back: "Every prime exponent must be even. Pair the primes and take one from each pair.",
      },
      {
        front: "Simplify $\\sqrt[3]{ab}$.",
        back: tex`$\sqrt[3]{ab}=\sqrt[3]{a}\,\sqrt[3]{b}$. The same product rule works for any root.`,
      },
      {
        front: "Write $\\sqrt{x}$ as a power.",
        back: tex`$\sqrt{x}=x^{\frac{1}{2}}$.`,
      },
      {
        front: "Simplify $(ab)^m$.",
        back: tex`$(ab)^m=a^m b^m$.`,
      },
      {
        front: "Give the decimal value of $\\sqrt{2}$ to three places.",
        back: tex`$\sqrt{2}\approx1.414$.`,
      },
      {
        front: "Give the decimal value of $\\sqrt{3}$ to three places.",
        back: tex`$\sqrt{3}\approx1.732$.`,
      },
      {
        front: "Give the decimal value of $\\sqrt{5}$ to three places.",
        back: tex`$\sqrt{5}\approx2.236$.`,
      },
      {
        front: "What is $\\pi$ to three decimal places, and as a useful fraction?",
        back: tex`$\pi\approx3.142$, and $\pi\approx\frac{22}{7}$. Use $\frac{22}{7}$ when the radius is a multiple of $7$.`,
      },
      {
        front: "Use the ending-in-5 shortcut to square $35$.",
        back: tex`$3\times4=12$, then append $25$: $35^2=1225$.`,
      },
      {
        front: "Use an identity to calculate $19\times21$.",
        back: tex`$20^2-1^2=400-1=399$. Numbers two apart use $a^2-b^2$.`,
      },
      {
        front: "Between which two perfect squares does $\\sqrt{50}$ lie?",
        back: tex`$49<50<64$, so $7<\sqrt{50}<8$; it is about $7.07$.`,
      },
    ],
  },
  {
    id: "f5-algebra",
    title: "Basic Algebra",
    subtitle: "Letters, terms and one-step equations",
    stage: "foundations",
    chapter: "foundation-5-basic-algebra",
    cards: [
      {
        front: "Simplify $ax+bx$.",
        back: tex`$(a+b)x$. Only like terms can be collected.`,
      },
      {
        front: "Expand $a(b+c)$.",
        back: tex`$ab+ac$.`,
      },
      {
        front: "Remove the brackets: $a-(b+c)$.",
        back: tex`$a-b-c$. The minus sign changes every sign inside the bracket.`,
      },
      {
        front: "Solve $x+a=b$.",
        back: tex`$x=b-a$. Subtract $a$ from both sides.`,
      },
      {
        front: "Solve $ax=b$ for $a\\ne0$.",
        back: tex`$x=\frac{b}{a}$. Divide both sides by $a$.`,
      },
      {
        front: "Solve $\\frac{x}{a}=b$ for $a\\ne0$.",
        back: tex`$x=ab$. Multiply both sides by $a$.`,
      },
      {
        front: "How do you check an equation solution?",
        back: "Substitute the value into the original equation. Both sides must give the same number.",
      },
      {
        front: "Simplify $3x+5-2x+7$.",
        back: tex`$x+12$. Collect $3x-2x$ and $5+7$.`,
      },
      {
        front: "Solve $4(x-1)=2x+6$.",
        back: tex`$4x-4=2x+6$, so $2x=10$ and $x=5$. Expand first, then collect.`,
      },
      {
        front: "Solve $7x-3=3x+17$.",
        back: tex`$4x=20$, so $x=5$. Move all $x$ terms to one side.`,
      },
      {
        front: "Solve $\\frac{x}{2}+\\frac{x}{3}=10$.",
        back: tex`Multiply by $6$: $3x+2x=60$, so $5x=60$ and $x=12$.`,
      },
      {
        front: "What does it mean if the variables cancel and you get $3=5$?",
        back: "The equation has no solution. If you get a true statement such as $4=4$, it is an identity and every value works.",
      },
    ],
  },
  {
    id: "f6-identities",
    title: "Algebraic Operations",
    subtitle: "Expanding, factorising and the core identities",
    stage: "foundations",
    chapter: "foundation-6-algebraic-operations",
    cards: [
      {
        front: "Expand $(a+b)^2$.",
        back: tex`$a^2+2ab+b^2$.`,
      },
      {
        front: "Expand $(a-b)^2$.",
        back: tex`$a^2-2ab+b^2$.`,
      },
      {
        front: "Factorise $a^2-b^2$.",
        back: tex`$(a+b)(a-b)$. Difference of two squares.`,
      },
      {
        front: "Expand $(x+a)(x+b)$.",
        back: tex`$x^2+(a+b)x+ab$.`,
      },
      {
        front: "Factorise $ab+ac$.",
        back: tex`$a(b+c)$. Take out the common factor.`,
      },
      {
        front: "Use an identity to calculate $101^2$.",
        back: tex`$(100+1)^2=10000+200+1=10201$.`,
      },
      {
        front: "Simplify $a-(b+c)$.",
        back: tex`$a-b-c$.`,
      },
    ],
  },
  {
    id: "f7-geometry",
    title: "Geometry Vocabulary",
    subtitle: "Angles, triangles and the circle",
    stage: "foundations",
    chapter: "foundation-7-geometry-vocabulary",
    cards: [
      {
        front: "Angles on a straight line add up to what?",
        back: tex`$180^\circ$.`,
      },
      {
        front: "Angles around a point add up to what?",
        back: tex`$360^\circ$.`,
      },
      {
        front: "What do complementary and supplementary angles add up to?",
        back: tex`Complementary: $90^\circ$. Supplementary: $180^\circ$.`,
      },
      {
        front: "What is true about vertically opposite angles?",
        back: "They are equal.",
      },
      {
        front: "What is the angle sum of a triangle?",
        back: tex`$180^\circ$.`,
      },
      {
        front: "What is the angle sum of a quadrilateral?",
        back: tex`$360^\circ$.`,
      },
      {
        front: "What is the exterior angle of a triangle equal to?",
        back: "The sum of the two opposite interior angles.",
      },
      {
        front: "What is special about the base angles of an isosceles triangle?",
        back: "They are equal.",
      },
      {
        front: "What is each angle of an equilateral triangle?",
        back: tex`$60^\circ$.`,
      },
      {
        front: "How are a circle's diameter and radius related?",
        back: tex`$d=2r$, or $r=\frac{d}{2}$.`,
      },
    ],
  },
  {
    id: "f8-measurement",
    title: "Measurement and Units",
    subtitle: "Conversions and mensuration formulas",
    stage: "foundations",
    chapter: "foundation-8-measurement-and-units",
    cards: [
      {
        front: "Convert kilometres to metres.",
        back: "Multiply by 1000.",
      },
      {
        front: "Convert metres to centimetres.",
        back: "Multiply by 100.",
      },
      {
        front: "Convert centimetres to millimetres.",
        back: "Multiply by 10.",
      },
      {
        front: "Convert kilograms to grams.",
        back: "Multiply by 1000.",
      },
      {
        front: "Convert litres to millilitres.",
        back: "Multiply by 1000.",
      },
      {
        front: "Convert square metres to square centimetres.",
        back: "Multiply by 10,000, because $1\\text{ m}=100\\text{ cm}$ and $100^2=10{,}000$.",
      },
      {
        front: "Convert cubic metres to cubic centimetres.",
        back: "Multiply by 1,000,000.",
      },
      {
        front: "Area of a rectangle and a triangle.",
        back: tex`Rectangle: $A=lw$. Triangle: $A=\frac{1}{2}bh$.`,
      },
      {
        front: "Area and circumference of a circle.",
        back: tex`$A=\pi r^2$ and $C=2\pi r$.`,
      },
      {
        front: "Volume of a cuboid.",
        back: tex`$V=lwh$.`,
      },
      {
        front: "Write the speed formula and its two rearrangements.",
        back: tex`$s=\frac{d}{t}$, so $d=st$ and $t=\frac{d}{s}$.`,
      },
      {
        front: "Why must units match before you add or compare lengths?",
        back: "Adding unlike units mixes different-sized parts. Convert everything to one unit first.",
      },
      {
        front: "Going from a bigger unit to a smaller unit, do you multiply or divide?",
        back: "Multiply. For example $2.6\\text{ km}=2600\\text{ m}$. Going the other way, divide.",
      },
      {
        front: "How many centimetres are in a kilometre?",
        back: "100,000 cm, because $1\\text{ km}=1000\\text{ m}$ and $1\\text{ m}=100\\text{ cm}$.",
      },
      {
        front: "Convert $640\\text{ cm}$ to metres.",
        back: "$640\\div100=6.4\\text{ m}$.",
      },
      {
        front: "Convert $72\\text{ km/h}$ to m/s.",
        back: "$72\\times\\frac{5}{18}=20\\text{ m/s}$.",
      },
      {
        front: "Convert $15\\text{ m/s}$ to km/h.",
        back: "$15\\times\\frac{18}{5}=54\\text{ km/h}$.",
      },
      {
        front: "How do you convert $\\text{cm}^2$ to $\\text{m}^2$?",
        back: "Divide by 10,000, because both dimensions change by a factor of 100.",
      },
      {
        front: "Write 45 minutes as a fraction of an hour.",
        back: "$\\frac{45}{60}=\\frac{3}{4}$ of an hour, or 0.75 h.",
      },
    ],
  },
  {
    id: "c9-number-systems",
    title: "Number Systems",
    subtitle: "Rationals, irrationals and real exponents",
    stage: "part1",
    chapter: "number-systems",
    cards: [
      {
        front: "Define a rational number.",
        back: tex`A number that can be written as $\frac{p}{q}$ with integers $p,q$ and $q\ne0$.`,
      },
      {
        front: "Define an irrational number.",
        back: "A real number that cannot be written as a fraction of two integers. Its decimal neither terminates nor repeats.",
      },
      {
        front: "Simplify $\\sqrt{a}\\,\\sqrt{b}$ for $a,b\\ge0$.",
        back: tex`$\sqrt{ab}$.`,
      },
      {
        front: "Simplify $\\frac{\\sqrt{a}}{\\sqrt{b}}$ for $b>0$.",
        back: tex`$\sqrt{\frac{a}{b}}$.`,
      },
      {
        front: "Write $\\sqrt{x}$ as a power.",
        back: tex`$x^{\frac{1}{2}}$.`,
      },
      {
        front: "Write $a^{m/n}$ in radical form.",
        back: tex`$a^{m/n}=\sqrt[n]{a^m}$.`,
      },
      {
        front: "When does a rational number have a terminating decimal?",
        back: "When, in lowest terms, the denominator has only the prime factors 2 and 5.",
      },
      {
        front: "Is $0.1010010001\\ldots$ rational or irrational?",
        back: "Irrational: the decimal does not repeat. A repeating pattern would make it rational.",
      },
      {
        front: "Simplify $\\left(\\frac{a}{b}\\right)^m$ for $b\\ne0$.",
        back: tex`$\frac{a^m}{b^m}$.`,
      },
      {
        front: "Why is $\\frac{0}{0}$ indeterminate?",
        back: "Because every number times $0$ gives $0$, so no single value can be chosen. By contrast $\\frac{0}{5}=0$.",
      },
      {
        front: "Is $\\infty$ a real number?",
        back: "No. It describes unbounded growth, not a position on the number line.",
      },
    ],
  },
  {
    id: "c9-polynomials",
    title: "Polynomials and Identities",
    subtitle: "Zeroes, theorems and the identity bank",
    stage: "part1",
    chapter: "polynomials",
    cards: [
      {
        front: "What is the degree of $ax^2+bx+c$?",
        back: tex`$2$ — the highest power of $x$ with a non-zero coefficient.`,
      },
      {
        front: "What is a zero of a polynomial $p(x)$?",
        back: tex`A value $k$ such that $p(k)=0$.`,
      },
      {
        front: "State the remainder theorem.",
        back: tex`When $p(x)$ is divided by $x-a$, the remainder is $p(a)$.`,
      },
      {
        front: "State the factor theorem.",
        back: tex`$x-a$ is a factor of $p(x)$ exactly when $p(a)=0$.`,
      },
      {
        front: "Expand $(a+b)^3$.",
        back: tex`$a^3+3a^2b+3ab^2+b^3 = a^3+b^3+3ab(a+b)$.`,
      },
      {
        front: "Expand $(a-b)^3$.",
        back: tex`$a^3-3a^2b+3ab^2-b^3 = a^3-b^3-3ab(a-b)$.`,
      },
      {
        front: "Factorise $a^3+b^3$.",
        back: tex`$(a+b)(a^2-ab+b^2)$.`,
      },
      {
        front: "Factorise $a^3-b^3$.",
        back: tex`$(a-b)(a^2+ab+b^2)$.`,
      },
      {
        front: "Expand $(a+b+c)^2$.",
        back: tex`$a^2+b^2+c^2+2ab+2bc+2ca$.`,
      },
      {
        front: "Simplify $(a+b)^2-(a-b)^2$.",
        back: tex`$4ab$.`,
      },
      {
        front: "Factorise $x^2+5x+6$.",
        back: tex`$(x+2)(x+3)$. Two numbers with product $6$ and sum $5$.`,
      },
    ],
  },
  {
    id: "c9-geometry",
    title: "Perimeter, Area and Heron",
    subtitle: "Every mensuration formula in one deck",
    stage: "part1",
    chapter: "geometry-basics",
    cards: [
      {
        front: "Perimeter and area of a square.",
        back: tex`$P=4s$, $A=s^2$.`,
      },
      {
        front: "Perimeter and area of a rectangle.",
        back: tex`$P=2(l+w)$, $A=lw$.`,
      },
      {
        front: "Area of a triangle from base and height.",
        back: tex`$A=\frac{1}{2}bh$.`,
      },
      {
        front: "Circumference and area of a circle.",
        back: tex`$C=2\pi r$, $A=\pi r^2$.`,
      },
      {
        front: "Area of a parallelogram.",
        back: tex`$A=bh$, where $b$ is the base and $h$ is the perpendicular height.`,
      },
      {
        front: "Area of a rhombus from its diagonals.",
        back: tex`$A=\frac{1}{2}d_1d_2$.`,
      },
      {
        front: "Area of a trapezium.",
        back: tex`$A=\frac{1}{2}(b_1+b_2)h$.`,
      },
      {
        front: "State Heron's formula.",
        back: tex`$s=\frac{a+b+c}{2}$ and $A=\sqrt{s(s-a)(s-b)(s-c)}$.`,
      },
      {
        front: "Why does the height have to be perpendicular in $A=\\frac{1}{2}bh$?",
        back: "The formula measures the perpendicular distance between parallel lines. A slanted side overstates the area.",
      },
    ],
  },
  {
    id: "c9-linear-equations",
    title: "Linear Equations in Two Variables",
    subtitle: "Solutions, tables and graphs",
    stage: "part2",
    chapter: "linear-equations",
    cards: [
      {
        front: "Write the standard form of a linear equation in two variables.",
        back: tex`$ax+by+c=0$, where $a$ and $b$ are not both zero.`,
      },
      {
        front: "What does a solution of $ax+by+c=0$ look like?",
        back: "An ordered pair $(x,y)$ that makes the equation true.",
      },
      {
        front: "How many solutions does a linear equation in two variables have?",
        back: "Infinitely many. The graph is a straight line, and every point on it is a solution.",
      },
      {
        front: "What does the graph of $y=k$ look like?",
        back: "A horizontal line passing through $(0,k)$, parallel to the x-axis.",
      },
      {
        front: "What does the graph of $x=k$ look like?",
        back: "A vertical line passing through $(k,0)$, parallel to the y-axis.",
      },
      {
        front: "Find $y$ when $2x+3y=12$ and $x=0$.",
        back: tex`$3y=12$, so $y=4$. The point is $(0,4)$.`,
      },
      {
        front: "How do you draw the graph of a linear equation quickly?",
        back: "Find two easy points, often the intercepts, plot them, and join with a straight line.",
      },
    ],
  },
  {
    id: "c9-inequalities",
    title: "Linear Inequalities",
    subtitle: "Solving and graphing with the sign rule",
    stage: "enrichment",
    chapter: "linear-inequalities",
    cards: [
      {
        front: "Which operation flips the direction of an inequality?",
        back: "Multiplying or dividing both sides by a negative number.",
      },
      {
        front: "Solve $2x+3<11$.",
        back: tex`$2x<8$, so $x<4$.`,
      },
      {
        front: "What does $x\\ge2$ look like on a number line?",
        back: "A closed circle at 2 and shading to the right, because 2 is included.",
      },
      {
        front: "What does $x<2$ look like on a number line?",
        back: "An open circle at 2 and shading to the left, because 2 is not included.",
      },
      {
        front: "If $a<b$, what happens when you add the same number to both sides?",
        back: "The inequality is preserved: $a+c<b+c$.",
      },
    ],
  },
  {
    id: "enrich-beyond",
    title: "Beyond Class 9",
    subtitle: "Complex numbers and radians",
    stage: "enrichment",
    chapter: "beyond-class-9",
    cards: [
      {
        front: "What is $i$, and what is $i^2$?",
        back: tex`$i=\sqrt{-1}$ and $i^2=-1$.`,
      },
      {
        front: "Simplify $\\sqrt{-9}$.",
        back: tex`$\sqrt{-9}=3i$, because $\sqrt{-9}=\sqrt{9}\times\sqrt{-1}=3i$.`,
      },
      {
        front: "Complete: $\\pi$ radians $=$ ? degrees.",
        back: tex`$\pi$ radians $=180^\circ$.`,
      },
      {
        front: "Convert $\\frac{3\\pi}{4}$ radians to degrees.",
        back: tex`Replace $\pi$ with $180^\circ$: $\frac{3\times180}{4}=135^\circ$.`,
      },
      {
        front: "Convert $210^\circ$ to radians.",
        back: tex`$210\times\frac{\pi}{180}=\frac{7\pi}{6}$.`,
      },
    ],
  },
];

export const decks = DECKS.map((deck) => ({
  ...deck,
  cards: deck.cards.map((card, index) => ({
    ...card,
    id: `${deck.id}-${index + 1}`,
    deck: deck.id,
  })),
}));

export const deckById = Object.fromEntries(decks.map((deck) => [deck.id, deck]));

export const allCards = decks.flatMap((deck) => deck.cards);

export function cardsForDecks(deckIds) {
  const wanted = new Set(deckIds);
  return decks.filter((deck) => wanted.has(deck.id)).flatMap((deck) => deck.cards);
}

export function totalCards() {
  return allCards.length;
}
