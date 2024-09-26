import { CHAIN_NAMESPACES } from "@web3auth/base";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
import { Web3Auth } from "@web3auth/modal";

const clientId =
  "BGUM9pLACidLnpI8zYVxTONoaKHV59U8-5Cw9vjdLaIn9r6RU0TLCItXpLsDjVQPAcfcWKlWVm9CDU5mBlElX0M";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.XRPL,
  chainId: "0x2",
  rpcTarget: "https://testnet-ripple-node.tor.us",
  wsTarget: "wss://s.altnet.rippletest.net",
  ticker: "XRP",
  logo: "https://web3auth.io/images/web3auth-logo.svg",
  tickerName: "XRPL",
  displayName: "xrpl testnet",
  blockExplorerUrl: "https://testnet.xrpl.org",
  clientId: "",
};

const privateKeyProvider = new XrplPrivateKeyProvider({
  config: { chainConfig },
});

export const web3auth = new Web3Auth({
  clientId,
  uiConfig: {
    logoLight: "https://web3auth.io/images/web3auth-logo.svg",
    logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
  },
  privateKeyProvider,
  web3AuthNetwork: "sapphire_devnet",
});
