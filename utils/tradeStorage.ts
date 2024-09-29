export const setTradeInfo = (
  tradeId: string,
  buyer: string,
  seller: string,
) => {
  const tradeInfo = { tradeId, buyer, seller };
  localStorage.setItem('tradeInfo', JSON.stringify(tradeInfo));
};

export const getTradeInfo = () => {
  const tradeInfo = localStorage.getItem('tradeInfo');
  return tradeInfo ? JSON.parse(tradeInfo) : null;
};
