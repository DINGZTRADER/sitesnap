import Image from 'next/image';

type PhotoImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

export function PhotoImage({ src, alt, className, sizes = '(max-width: 768px) 100vw, 50vw', priority = false, fill = false }: PhotoImageProps) {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return <img src={src} alt={alt} className={className} />;
  }

  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }

  return <Image src={src} alt={alt} width={1200} height={800} sizes={sizes} priority={priority} className={className} />;
}
