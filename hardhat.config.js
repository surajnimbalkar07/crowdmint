require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  defaultNetwork: 'sepolia', // changed from polygon_amoy to sepolia
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      url: process.env.ENDPOINT_URL, // Sepolia endpoint from Infura or Alchemy
      accounts: [process.env.DEPLOYER_KEY], // your private key from .env
    },
  },
  solidity: {
    version: '0.8.11',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './src/contracts',
    artifacts: './src/abis',
  },
  mocha: {
    timeout: 40000,
  },
};
