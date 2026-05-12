import { Composition } from 'remotion';
import { HelloWorld } from './HelloWorld';
import { HotelShowcase } from './templates/HotelShowcase';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id='HelloWorld'
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Welcome to Ongudai Camp',
          subtitle: 'Altai Mountains Adventure',
        }}
      />
      <Composition
        id='HotelShowcase'
        component={HotelShowcase as any}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Горный Алтай Отель',
          price: 3500,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
          rating: 4.8,
        }}
      />
    </>
  );
};
