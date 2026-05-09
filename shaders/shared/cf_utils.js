/**
 * Continued Fraction Utilities
 *
 * Functions for parsing, evaluating, and expanding continued fractions.
 * Intended for use in script.js files.
 *
 * A continued fraction [a0; a1, a2, ...] represents:
 *   a0 + 1/(a1 + 1/(a2 + ...))
 *
 * A quadratic CF has the form [prefix; period, period, ...]
 * where the period block repeats infinitely, representing a quadratic irrational.
 */

/**
 * Parse a comma or space separated string of integers into an array.
 * Returns an empty array for an empty or blank string.
 *
 * @param {string} str  e.g. "1, 2, 3" or "1 2 3"
 * @returns {number[]}
 */
export function parseCF(str) {
  if (!str || !str.trim()) return [];
  return str.split(/[\s,]+/)
    .map(s => parseInt(s, 10))
    .filter(n => !isNaN(n));
}

/**
 * Evaluate a finite continued fraction given its coefficients.
 *
 * @param {number[]} coeffs  e.g. [1, 2, 3] → 1 + 1/(2 + 1/3) = 10/7
 * @returns {number}
 */
export function finiteCF(coeffs) {
  if (coeffs.length === 0) return 0;
  let result = coeffs[coeffs.length - 1];
  for (let i = coeffs.length - 2; i >= 0; i--)
    result = coeffs[i] + 1 / result;
  return result;
}

/**
 * Evaluate a quadratic (eventually periodic) continued fraction.
 *
 * Represents [prefix[0]; prefix[1], ..., period[0], period[1], ..., period[0], ...]
 * where the period block repeats infinitely.
 *
 * The periodic part is computed exactly by solving the quadratic equation
 * that the repeating block satisfies.
 *
 * @param {number[]} prefix  Non-repeating leading coefficients (may be empty)
 * @param {number[]} period  Repeating block (must be non-empty)
 * @returns {number}
 */
export function quadCF(prefix, period) {
  if (period.length === 0) return finiteCF(prefix);

  // Build the matrix product M = M_b1 * M_b2 * ... * M_bm
  // where M_b = [[b, 1], [1, 0]]
  // The periodic value x satisfies x = (M[0][0]*x + M[0][1]) / (M[1][0]*x + M[1][1])
  let M = [[1, 0], [0, 1]];
  for (const b of period) {
    M = [
      [b * M[0][0] + M[0][1],  M[0][0]],
      [b * M[1][0] + M[1][1],  M[1][0]],
    ];
  }

  // Rearranges to: M[1][0]*x^2 + (M[1][1] - M[0][0])*x - M[0][1] = 0
  const a = M[1][0];
  const b = M[1][1] - M[0][0];
  const c = -M[0][1];
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) throw new Error('quadraticCF: negative discriminant');
  let x = (-b + Math.sqrt(discriminant)) / (2 * a);

  for (let i = prefix.length - 1; i >= 0; i--)
    x = prefix[i] + 1 / x;

  return x;
}

/**
 * Evaluate a quadratic CF with the period reversed.
 * e.g. period [1, 2, 3] is evaluated as [3, 2, 1, 3, 2, 1, ...]
 *
 * @param {number[]} prefix
 * @param {number[]} period
 * @returns {number}
 */
export function quadReverseCF(prefix, period) {
  return quadCF(prefix, period.slice().reverse());
}

/**
 * Convenience wrapper: parse two strings and evaluate a quadratic CF.
 *
 * @param {string} prefixStr  Non-repeating part, e.g. "2, 1"  (may be empty)
 * @param {string} periodStr  Repeating block,    e.g. "3, 1"
 * @returns {number}
 */
export function quadCFStrings(prefixStr, periodStr) {
  return quadCF(parseCF(prefixStr), parseCF(periodStr));
}

/**
 * Reverse a comma/space-separated string of integers.
 * e.g. "1, 2, 3, 4" → "4, 3, 2, 1"
 *
 * @param {string} str
 * @returns {string}
 */
export function reverseCFString(str) {
  return parseCF(str).reverse().join(', ');
}

/**
 * Compute the convergents of a finite continued fraction.
 * Convergents are the best rational approximations p/q to the value.
 *
 * @param {number[]} coeffs
 * @returns {{ p: number, q: number }[]}  Array of { p, q } pairs
 */
export function convergents(coeffs) {
  const result = [];
  let p_prev = 1, p_curr = coeffs[0];
  let q_prev = 0, q_curr = 1;
  result.push({ p: p_curr, q: q_curr });
  for (let i = 1; i < coeffs.length; i++) {
    const p_next = coeffs[i] * p_curr + p_prev;
    const q_next = coeffs[i] * q_curr + q_prev;
    result.push({ p: p_next, q: q_next });
    p_prev = p_curr; p_curr = p_next;
    q_prev = q_curr; q_curr = q_next;
  }
  return result;
}

/**
 * Compute the CF expansion of a positive real number up to maxTerms terms.
 * Useful for finding the CF representation of a known value.
 *
 * @param {number} x
 * @param {number} maxTerms  Default 20
 * @param {number} eps       Stopping tolerance. Default 1e-10
 * @returns {number[]}
 */
export function cfExpansion(x, maxTerms = 20, eps = 1e-10) {
  const coeffs = [];
  for (let i = 0; i < maxTerms; i++) {
    const a = Math.floor(x);
    coeffs.push(a);
    const remainder = x - a;
    if (remainder < eps) break;
    x = 1 / remainder;
  }
  return coeffs;
}
