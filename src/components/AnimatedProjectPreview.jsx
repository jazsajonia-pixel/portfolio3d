export default function AnimatedProjectPreview({ src, alt, className = '' }) {
  return (
    <div className={`relative aspect-[8/5] w-full overflow-hidden bg-slate-950 ${className}`}>
      <img
        src={src}
        alt={alt}
        width={1200}
        height={750}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
