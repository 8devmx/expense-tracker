export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = Number(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
