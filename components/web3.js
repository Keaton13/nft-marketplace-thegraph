const Web3 = require("web3");

const provider = new Web3.providers.HttpProvider(
    `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
  );

  const web3 = new Web3(provider);


export default web3;
