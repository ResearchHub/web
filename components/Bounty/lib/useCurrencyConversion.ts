export function useCurrencyConversion(exchangeRate: number) {
  const convertToRSC = (amount: number) => {
    return Math.round(amount / exchangeRate);
  };

  const convertToUSD = (amount: number) => {
    return Number((amount * exchangeRate).toFixed(2));
  };

  return { convertToRSC, convertToUSD };
}
