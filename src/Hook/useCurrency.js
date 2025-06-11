import { useSelector } from "react-redux";

export const useCurrency = () => {
  const { defaultCurrency } = useSelector((state) => state.systemSettings);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "--";
    
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: defaultCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formattedAmount;
  };

  return {
    currency: defaultCurrency,
    formatCurrency,
  };
}; 