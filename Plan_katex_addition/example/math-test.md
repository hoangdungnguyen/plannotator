# LaTeX Math Test Document

## Inline Math

Inline math works like this: $E = mc^2$ and this $\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$.

You can also write $\frac{a}{b}$ inline with other text.

## Block Math

Block math on its own line:

$$\int_0^1 x \, dx = \frac{1}{2}$$

And the quadratic formula:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

## Math in Lists

- The derivative: $f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$
- Euler's identity: $e^{i\pi} + 1 = 0$
- Sum notation: $\sum_{i=1}^n i = \frac{n(n+1)}{2}$

## Math with Code

This code block should NOT render math:

```
This is code: $E = mc^2$ and $$\int_0^1 x dx$$
```

## Invalid LaTeX

This should show an error (unclosed delimiter):

$E = mc^2$

## Complex Expressions

Matrix notation:

$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$

Summation and product:

$$\prod_{i=1}^n x_i \quad \sum_{j=0}^m y_j$$
