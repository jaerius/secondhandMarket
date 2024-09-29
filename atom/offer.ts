// atoms.ts
import { atom, selector, AtomEffect } from 'recoil';

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key: string) =>
  ({ setSelf, onSet }) => {
    if (typeof window !== 'undefined') {
      const savedValue = localStorage.getItem(key);
      if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
      }

      onSet((newValue, _, isReset) => {
        isReset
          ? localStorage.removeItem(key)
          : localStorage.setItem(key, JSON.stringify(newValue));
      });
    }
  };

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

export const processedOfferCountState = atom({
  key: 'processedOfferCountState',
  default: 0,
  effects: [localStorageEffect<number>('processedOfferCount')],
});
