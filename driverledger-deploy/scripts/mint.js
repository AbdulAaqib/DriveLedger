const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace this with your deployed contract address
  const contractAddress = "0xB6D0cECcb62541fFe71D5CA7776920D8ABf2705D";

  // Get contract instance
  const DriverLedger = await hre.ethers.getContractAt("DriverLedger", contractAddress);

  // Mint parameters
  const toAddress = "0x1a0a593AA9206c55b05Da21E048a456258Ee02Dc";          // recipient of the NFT
  const tokenId = 23;                          // unique token ID, increment for each new mint
  const tokenURI = "ipfs://QmTRGcRZNqSj9Nr1Xwn8NTZj2oXKcT18ECtADWQp2dV7zf";  // metadata URI for the token

  // Mint the NFT
  const tx = await DriverLedger.safeMint(toAddress, tokenId, tokenURI);
  await tx.wait();

  console.log(`Transaction Hash: ${tx.hash}`);
  console.log(`Minted token ID ${tokenId} to address ${toAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
