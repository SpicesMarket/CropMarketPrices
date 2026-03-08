/**
 * Calculates the average of an array of numbers.
 * @param {number[]} prices - Array of numbers
 * @returns {number} Average value, or 0 if input is invalid
 */
function calculateAverage(prices) {
  if (!Array.isArray(prices) || prices.length === 0) {
    return 0;
  }
  const sum = prices.reduce((acc, val) => acc + Number(val), 0);
  return sum / prices.length;
}

module.exports = { calculateAverage };
