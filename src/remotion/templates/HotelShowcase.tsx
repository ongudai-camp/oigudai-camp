import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Img, Sequence } from 'remotion';

interface HotelProps {
  title: string;
  price: number;
  image: string;
  rating: number;
}

export const HotelShowcase: React.FC<HotelProps> = ({ title, price, image, rating }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const moveUp = interpolate(frame, [0, 60], [100, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 150], [1, 1.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0C4A6E' }}>
      {/* Background Image with Zoom */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img 
          src={image} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(12, 74, 110, 0.4)' }} />
      </AbsoluteFill>

      {/* Info Overlay */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: 100 }}>
        <div style={{ 
          transform: `translateY(${moveUp}px)`, 
          opacity,
          backgroundColor: 'white',
          padding: 60,
          borderRadius: 40,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          maxWidth: 800
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 40, color: '#F97316', marginRight: 10 }}>⭐</span>
            <span style={{ fontSize: 36, fontWeight: 'bold', color: '#0C4A6E' }}>{rating}</span>
          </div>
          <h1 style={{ fontSize: 80, fontWeight: 'black', color: '#0C4A6E', marginBottom: 20, lineHeight: 1.1 }}>
            {title}
          </h1>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#F97316' }}>
            от {price} ₽ / ночь
          </div>
        </div>
      </AbsoluteFill>

      {/* Brand Logo */}
      <div style={{ 
        position: 'absolute', 
        top: 60, 
        left: 60, 
        fontSize: 40, 
        fontWeight: '900', 
        color: 'white',
        letterSpacing: -2
      }}>
        ONGUDAI<span style={{ color: '#F97316' }}>CAMP</span>
      </div>
    </AbsoluteFill>
  );
};
