import Image from 'next/image'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

type Props = {
  size: number
  className?: string
}

export function SynergiBrandMark({ size, className }: Props) {
  return (
    <Image
      src={SYNERGI_BRAND.logoPath}
      alt={SYNERGI_BRAND.name}
      width={size}
      height={size}
      className={className}
    />
  )
}
