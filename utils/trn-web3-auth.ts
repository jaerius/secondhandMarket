import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";

const clientId =
  "BGUM9pLACidLnpI8zYVxTONoaKHV59U8-5Cw9vjdLaIn9r6RU0TLCItXpLsDjVQPAcfcWKlWVm9CDU5mBlElX0M";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1df8",
  rpcTarget: "https://porcini.rootnet.app/archive",
  wsTarget: "wss://porcini.rootnet.app/archive/ws",
  ticker: "XRP",
  logo: "https://web3auth.io/images/web3auth-logo.svg",
  tickerName: "XRPL",
  displayName: "trn testnet",
  blockExplorerUrl: "https://porcini.rootscan.io",
  clientId: "",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const trnWeb3auth = new Web3Auth({
  clientId,
  uiConfig: {
    logoLight: "https://web3auth.io/images/web3auth-logo.svg",
    logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
  },
  privateKeyProvider,
  web3AuthNetwork: "sapphire_devnet",
});
