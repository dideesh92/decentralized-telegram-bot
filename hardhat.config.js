require("@nomicfoundation/hardhat-toolbox")
require('dotenv').config();
const alchemyurl=process.env.alchemyUrl;
const privatekey=process.env.alchemyUrl;
``
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"alchemy",
  networks:{
    localhost:{
      url:"http://127.0.0.1:8545/"

    },
    alchemy:{
      url:alchemyurl,
      accounts:[privatekey]
    }
  },
  solidity: "0.8.26",
};
