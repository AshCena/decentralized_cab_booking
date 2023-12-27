const PassContract = artifacts.require("PassContract");

module.exports = function (deployer) {
    deployer.deploy(PassContract, "0xb7F7f13b04F788A57B4aAd28DA568bA2a4882e7C");
};
