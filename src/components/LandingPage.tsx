import React, { useEffect, useRef } from 'react';
import * as anime from 'animejs';
import WorldMap from './ui/world-map';

const LandingPage: React.FC<{ onEnter: () => void }>= ({ onEnter }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (anime as any).timeline({ easing: 'easeOutQuad' })
      .add({ targets: titleRef.current, translateY: [20, 0], opacity: [0, 1], duration: 700 })
      .add({ targets: subtitleRef.current, translateY: [20, 0], opacity: [0, 1], duration: 600 }, '-=300')
      .add({ targets: ctaRef.current, scale: [0.9, 1], opacity: [0, 1], duration: 500 }, '-=250');
  }, []);

  return (
    <div className="min-h-screen bg-marine-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full">
          <WorldMap />
        </div>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-extrabold tracking-tight">
          SAGAR
        </h1>
        <p ref={subtitleRef} className="mt-4 text-lg text-gray-300">
          Spatio-temporal Analytics Gateway for Aquatic Resources
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button
            ref={ctaRef}
            onClick={onEnter}
            className="px-6 py-3 bg-gradient-to-r from-marine-cyan to-marine-green text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


