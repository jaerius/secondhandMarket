import { ethers, BrowserProvider, Contract } from 'ethers';
import contractJSON from '../artifacts/contracts/ZKGameTradingContract.sol/ZKGameTradingContract.json';
import { getWeb3AuthSigner } from '../utils/web3_auth_sign';

const CONTRACT_ADDRESS: string = '0xD410658f238f11CA47657cAa00F2e85F3d9Ff00d';
const contractABI = contractJSON.abi;

export async function getContract(): Promise<Contract> {
  // if (typeof window.ethereum === 'undefined') {
  //   throw new Error('Ethereum provider not found. Please install MetaMask.');
  // }
  const signer = await getWeb3AuthSigner(); // Await the promise to get the signer object
  return new Contract(CONTRACT_ADDRESS, contractABI, signer);
}

export async function makeOffer(
  seller: string,
  sellerPrice: string,
  buyerOffer: string,
  zkProof: [bigint, bigint, bigint, bigint],
): Promise<ethers.TransactionReceipt | null> {
  const contract = await getContract();
  const tx = await contract.makeOffer(
    seller,
    sellerPrice,
    buyerOffer,
    ...zkProof,
    {
      value: ethers.parseEther(sellerPrice),
    },
  );
  return tx.wait();
}

export async function acceptOffer(
  tradeId: string,
): Promise<ethers.TransactionReceipt | null> {
  const contract = await getContract();
  const tx = await contract.acceptOffer(tradeId);
  console.log('Accept offer tx:', tx);
  return tx.wait();
}

export async function startGame(
  tradeId: string,
): Promise<ethers.TransactionReceipt | null> {
  const contract = await getContract();
  const tx = await contract.startGame(tradeId);
  return tx.wait();
}

export async function endGame(
  tradeId: string,
  buyerClicks: number,
  sellerClicks: number,
): Promise<ethers.TransactionReceipt | null> {
  const contract = await getContract();
  const tx = await contract.endGame(tradeId, buyerClicks, sellerClicks);
  return tx.wait();
}

export async function connectWallet(): Promise<string> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }
  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Ethereum provider not found. Please install MetaMask.');
    }
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('No wallet connected', error);
    return null;
  }
}
