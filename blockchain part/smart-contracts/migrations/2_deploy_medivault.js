const MediVaultAccess = artifacts.require("MediVaultAccess");

module.exports = async function (deployer, network, accounts) {
  console.log("\n========================================");
  console.log("  Deploying MediVaultAccess Contract");
  console.log("========================================");
  console.log("Deployer account:", accounts[0]);

  await deployer.deploy(MediVaultAccess, {
    from: accounts[0],
    gas: 5000000
  });

  const instance = await MediVaultAccess.deployed();

  console.log("\n✅ Contract deployed at:", instance.address);
  console.log("SAVE THIS ADDRESS for your .env files!\n");

  // Auto-register test accounts for development
  if (network === "development") {

    await instance.registerUser(
      accounts[1],
      "Dr. Sarah Johnson",
      "doctor@medivault.com",
      2,  // Role.Doctor
      { from: accounts[0] }
    );
    console.log("✅ Doctor registered:", accounts[1]);

    await instance.registerUser(
      accounts[2],
      "Rahul Sharma",
      "patient@medivault.com",
      3,  // Role.Patient
      { from: accounts[0] }
    );
    console.log("✅ Patient registered:", accounts[2]);

    await instance.registerUser(
      accounts[3],
      "Dr. Michael Chen",
      "doctor2@medivault.com",
      2,  // Role.Doctor
      { from: accounts[0] }
    );
    console.log("✅ Doctor 2 registered:", accounts[3]);

    await instance.registerUser(
      accounts[4],
      "Priya Patel",
      "student@medivault.com",
      4,  // Role.Student
      { from: accounts[0] }
    );
    console.log("✅ Student registered:", accounts[4]);

    console.log("\n📋 Account Summary:");
    console.log("  Admin   :", accounts[0]);
    console.log("  Doctor1 :", accounts[1]);
    console.log("  Patient :", accounts[2]);
    console.log("  Doctor2 :", accounts[3]);
    console.log("  Student :", accounts[4]);
  }
};