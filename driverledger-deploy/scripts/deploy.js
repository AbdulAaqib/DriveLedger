const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const driverLedger = await hre.ethers.getContractFactory("DriverLedger");
  const DriverLedger = await driverLedger.deploy(deployer.address);

  await DriverLedger.waitForDeployment();
  console.log("DriverLedger deployed to:", DriverLedger.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});