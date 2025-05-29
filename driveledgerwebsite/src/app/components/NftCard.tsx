import { getOpenSeaNftUrl } from '../utils/nft'
import Link from 'next/link'
import Image from 'next/image'

interface NftCardProps {
  nftId: string
  title: string
  description: string
  imageUrl: string
}

export default function NftCard({ nftId, title, description, imageUrl }: NftCardProps) {
  const openSeaUrl = getOpenSeaNftUrl(nftId)
  
  return (
    <div className="glass-card p-4 space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Link 
        href={openSeaUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        <span>View on OpenSea</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </Link>
    </div>
  )
} 