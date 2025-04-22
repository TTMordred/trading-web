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
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format a price value with appropriate decimal places
 */
export const formatPrice = (price: number): string => {
  if (price < 0.00001) {
    return price.toFixed(8);
  } else if (price < 0.001) {
    return price.toFixed(6);
  } else if (price < 1) {
    return price.toFixed(4);
  } else if (price < 1000) {
    return price.toFixed(2);
  } else {
    return formatNumber(price, 2);
  }
};
