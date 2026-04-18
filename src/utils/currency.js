// Currency conversion utility
// Conversion rate: $45 = 65,000 RWF => 1 USD = 1,444 RWF
const USD_TO_RWF_RATE = 1444;

/**
 * Convert USD amount to RWF
 * @param {number} usdAmount - Amount in USD
 * @returns {number} - Amount in RWF
 */
export const usdToRwf = (usdAmount) => {
  if (!usdAmount || isNaN(usdAmount)) return 0;
  return Math.round(usdAmount * USD_TO_RWF_RATE);
};

/**
 * Format currency display with both USD and RWF
 * @param {number} usdAmount - Amount in USD
 * @param {object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (usdAmount, options = {}) => {
  const { showBoth = true, prefix = '' } = options;
  const rwfAmount = usdToRwf(usdAmount);
  
  if (!showBoth) {
    return `${prefix}$${usdAmount}`;
  }
  
  return `${prefix}$${usdAmount} (~${rwfAmount.toLocaleString()} RWF)`;
};

export default { usdToRwf, formatCurrency };
