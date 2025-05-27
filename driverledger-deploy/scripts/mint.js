// driverledger-deploy/scripts/mint.js

const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Your deployed DriverLedger contract address
  const contractAddress = "0xB6D0cECcb62541fFe71D5CA7776920D8ABf2705D";

  // Get contract instance
  const DriverLedger = await hre.ethers.getContractAt("DriverLedger", contractAddress);

  // Path to the JSON file we wrote in Python
  const dataPath = path.join(__dirname, "current_data.json");

  if (!fs.existsSync(dataPath)) {
    throw new Error(`File not found: ${dataPath}`);
  }

  const { unique_id: tokenId, ipfs_url } = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // Extract CID from gateway URL and build ipfs:// URI
  const cid = ipfs_url.split("/").pop();
  const tokenURI = `ipfs://${cid}`;

  // Recipient of the minted NFT
  const toAddress = "0x1a0a593AA9206c55b05Da21E048a456258Ee02Dc";

  console.log(`🔑 Minting tokenId ${tokenId} to ${toAddress}`);
  console.log(`🌐 tokenURI = ${tokenURI}`);

  const tx = await DriverLedger.safeMint(toAddress, tokenId, tokenURI);
  await tx.wait();

  console.log(`✅ Transaction Hash: ${tx.hash}`);
  console.log(`✅ Minted token ID ${tokenId} to address ${toAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
