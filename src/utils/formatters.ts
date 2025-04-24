/**
 * Format a number with commas as thousands separators
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number with appropriate units (K, M, B)
 */
export const formatNumberWithUnits = (num: number, digits: number = 2): string => {
  if (num === 0) return '0';

  const units = ['', 'K', 'M', 'B', 'T'];
  const k = 1000;
  const magnitude = Math.floor(Math.log(num) / Math.log(k));

  // Stay within our units array
  const unitIndex = Math.min(magnitude, units.length - 1);

  // Format the number
  const scaled = num / Math.pow(k, unitIndex);
  return scaled.toFixed(digits) + units[unitIndex];
};

/**
 * Format a price with appropriate decimal places based on its value
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return '0';

  // For extremely small prices (e.g., SHIB), show more decimal places
  if (price < 0.00001) return price.toFixed(8);

  // For very small prices, show 6 decimal places
  if (price < 0.001) return price.toFixed(6);

  // For small prices (e.g., DOGE), show 4 decimal places
  if (price < 1) return price.toFixed(4);

  // For medium prices (e.g., XRP), show 2 decimal places
  if (price < 1000) return price.toFixed(2);

  // For large prices (e.g., BTC), use comma formatting
  return formatNumber(price, 2);
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
