import Web3 from "web3";
import basicNftAbi from "./BasicNft.json";
import nftMarketplaceAbi from "./NftMarketplace.json";

const marketplaceAddress = "0xb9E00F95449102bD9572a38aF20c56039600F053";
const basicNftAddress = "0x87F23Ba263BD8AeE8e71b42f31E8a4148A3FD30B";

export const createContract = () => {
  const { ethereum } = window;

  if (ethereum) {
    const web3 = new Web3(ethereum);
    const nftMarketplaceContract = new web3.eth.Contract(nftMarketplaceAbi.abi, marketplaceAddress);
    const basicNftContract = new web3.eth.Contract(basicNftAbi.abi, basicNftAddress);

    return {
      basicNftContract,
      nftMarketplaceContract,
    };
  }
};