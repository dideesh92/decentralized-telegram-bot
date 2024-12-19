const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("TelegramBot", (m) =>{  //change cert module to game module [random name]
    const Tbot = m.contract("UserContract") //change cert to gameT since its the contract name
    return {Tbot}; 
})