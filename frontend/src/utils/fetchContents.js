import { ethers } from 'ethers'; 
import contractAbi from './SuperPiccellCore.json';

export async function fetchContents() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      // Use ethers to set the provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
      // Create an instance of the contract
      const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);
      
      // Call the contract's `getAllContents` method
      const contents = await contract.getAllContents();
      
      // Return the contents
      return contents;
    } else {
      alert('A wallet is not installed.');
    }
}
