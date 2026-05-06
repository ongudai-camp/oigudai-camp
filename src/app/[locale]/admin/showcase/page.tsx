'use client';

import { Player } from '@remotion/player';
import { HelloWorld } from '@/remotion/HelloWorld';

export default function ShowcasePage() {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Property Showcase Generator</h1>
      <div className='bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto'>
        <Player
          component={HelloWorld}
          durationInFrames={150}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
          inputProps={{
            title: 'Welcome to Ongudai Camp',
            subtitle: 'Altai Mountains Adventure',
          }}
        />
        <div className='mt-6 grid grid-cols-2 gap-4'>
          <button className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer'>
            Render MP4 Video
          </button>
          <button className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer'>
            Save as Template
          </button>
        </div>
      </div>
    </div>
  );
}
