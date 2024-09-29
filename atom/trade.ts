import { atom, AtomEffect } from 'recoil';

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

interface AcceptedTradeInfo {
  tradeId: string;
  buyer: string;
  seller: string;
}

export const showTradeAcceptedModalState = atom<boolean>({
  key: 'showTradeAcceptedModalState',
  default: false,
  effects: [localStorageEffect<boolean>('showTradeAcceptedModal')],
});

export const acceptedTradeInfoState = atom<AcceptedTradeInfo | null>({
  key: 'acceptedTradeInfoState',
  default: null,
  effects: [localStorageEffect<AcceptedTradeInfo | null>('acceptedTradeInfo')],
});
