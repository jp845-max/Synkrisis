export const calculateCommission = (budget) => {
  // Budget is in INR (Rupees)
  let commissionRate = 0;

  if (budget <= 5000) {
    commissionRate = 20; // 20%
  } else if (budget <= 20000) {
    commissionRate = 18; // 18%
  } else if (budget <= 50000) {
    commissionRate = 15; // 15%
  } else if (budget <= 100000) {
    commissionRate = 12; // 12%
  } else {
    commissionRate = 10; // 10%
  }

  // Calculate the amount
  const commissionAmount = (budget * commissionRate) / 100;
  
  // Calculate what provider gets
  const providerPayout = budget - commissionAmount;

  return {
    budget,
    commissionRate,
    commissionAmount,
    providerPayout,
  };
};
