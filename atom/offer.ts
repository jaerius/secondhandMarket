// atoms.ts
import { atom } from 'recoil';

export interface Offer {
  tradeId: string;
  buyer: string;
  seller: string;
  sellerPrice: string;
  buyerOffer: string;
}

export const offerCountState = atom({
  key: 'offerCountState',
  default: 0,
});

export const latestOfferState = atom<Offer | null>({
  key: 'latestOfferState',
  default: null,
});

export const showModalState = atom({
  key: 'showModalState',
  default: false,
});
