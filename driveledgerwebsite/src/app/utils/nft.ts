export const OPENSEA_BASE_URL = "https://opensea.io/item/matic/0xb6d0ceccb62541ffe71d5ca7776920d8abf2705d"

export const getOpenSeaNftUrl = (nftId: string) => {
  // Ensure the base URL doesn't end with a slash and the nftId is properly formatted
  const cleanBaseUrl = OPENSEA_BASE_URL.replace(/\/$/, "")
  const cleanNftId = nftId.replace(/^\/+/, "")
  return `${cleanBaseUrl}/${cleanNftId}`
}

export const generateNftMetadata = (nftId: string, name: string, description: string, image: string) => {
  return {
    name,
    description,
    image,
    attributes: [] // Add any attributes if needed
  }
}

// Example usage:
// const metadata = generateNftMetadata(
//   "123",
//   "My NFT",
//   "This is my awesome NFT",
//   "https://mypinata.cloud/ipfs/..."
// )
/*
Returns:
{
  name: "My NFT",
  description: "This is my awesome NFT",
  image: "https://mypinata.cloud/ipfs/...",
  attributes: []
}
*/ 