const MediVaultAccess = artifacts.require("MediVaultAccess");

module.exports = function (deployer) {
  deployer.deploy(MediVaultAccess);
};
