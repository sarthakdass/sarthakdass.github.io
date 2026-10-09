/* MathJax settings for the Writing section. Loaded before MathJax itself on every post that contains math.
 *
 * Write math in a post any of these ways:
 *   inline:   $x^2$      or  \( x^2 \)
 *   display:  $$ ... $$  or  \[ ... \]
 *   numbered: \begin{equation} ... \label{eq:a} \end{equation}  and refer to it with \eqref{eq:a}
 *   aligned:  \begin{align} a &= b \\ &= c \end{align}   (align*, gather, multline, ... also work)
 * A literal dollar sign is \$.
 *
 * Add your own shorthand under `macros`. A post can also define its own with \newcommand.
 */
window.MathJax = {
  loader: { load: ['[tex]/mathtools', '[tex]/cancel', '[tex]/boldsymbol'] },
  tex: {
    inlineMath: [['\\(', '\\)']],      // single $ is turned into \( \) when the page is built
    displayMath: [['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams',                      // numbers equation / align environments; \label and \eqref work
    tagSide: 'right',
    packages: { '[+]': ['mathtools', 'cancel', 'boldsymbol'] },
    macros: {
      R: '\\mathbb{R}', N: '\\mathbb{N}', Z: '\\mathbb{Z}', Q: '\\mathbb{Q}', C: '\\mathbb{C}', F: '\\mathbb{F}',
      E: '\\operatorname{\\mathbb{E}}', Pr: '\\operatorname{\\mathbb{P}}',
      Var: '\\operatorname{Var}', Cov: '\\operatorname{Cov}',
      eps: '\\varepsilon',
      norm: ['\\left\\lVert #1 \\right\\rVert', 1],
      abs: ['\\left\\lvert #1 \\right\\rvert', 1],
      inner: ['\\left\\langle #1, #2 \\right\\rangle', 2],
      set: ['\\left\\{ #1 \\right\\}', 1],
      dd: '\\mathrm{d}'
    }
  },
  chtml: { scale: 1.02, mtextInheritFont: true },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};
