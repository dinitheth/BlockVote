import { ethers } from 'ethers';
import { contractAbi } from './abi';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error(
    'NEXT_PUBLIC_CONTRACT_ADDRESS is not set in the environment variables. Please set it in your .env file'
  );
}

// This function is designed to work on the client side.
// It leverages the EIP-1193 provider injected by Privy.
export async function getSigner() {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    console.log("No ethereum provider found. Using read-only provider.");
    return null;
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const accounts = await provider.listAccounts();
  if (accounts.length === 0) {
    console.log("No accounts found. Using read-only provider.");
    return null;
  }
  return provider.getSigner();
}

// This function can work on both server and client.
// If a signer is provided, it returns a contract instance for writing transactions.
// If no signer is available, it returns a read-only contract instance.
export async function getContract(signer?: ethers.Signer | null) {
  if (signer) {
    return new ethers.Contract(contractAddress, contractAbi, signer);
  }
  
  // Use a dedicated RPC URL if available, otherwise fall back to the public one.
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet.abs.xyz';
  const readOnlyProvider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(contractAddress, contractAbi, readOnlyProvider);
}
