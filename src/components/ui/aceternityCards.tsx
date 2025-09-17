"use client";
import React, { useEffect } from 'react';
import { animate } from 'motion';
import { cn } from '../../lib/utils';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode; }) => {
  return (
    <div
      className={cn(
        'max-w-sm w-full mx-auto p-6 rounded-xl border border-[rgba(255,255,255,0.10)] bg-black/30 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] backdrop-blur-xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string; }) => (
  <h3 className={cn('text-lg font-semibold text-white py-1', className)}>{children}</h3>
);

export const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string; }) => (
  <p className={cn('text-sm text-white/70', className)}>{children}</p>
);

export const CardSkeletonContainer = ({ className, children, showGradient = true }: { className?: string; children: React.ReactNode; showGradient?: boolean; }) => (
  <div
    className={cn(
      'h-[12rem] rounded-xl relative overflow-hidden',
      className,
      showGradient &&
        'bg-white/10 [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]'
    )}
  >
    {children}
  </div>
);

export const CardDemo = () => {
  useEffect(() => {
    animate(
      [
        ['.pulse', { scale: [1, 1.05, 1] }, { duration: 1.2 }],
      ],
      { repeat: Infinity, repeatDelay: 0.5 }
    );
  }, []);
  return (
    <Card>
      <CardSkeletonContainer>
        <div className="pulse absolute inset-0" />
      </CardSkeletonContainer>
      <CardTitle>Damn good card</CardTitle>
      <CardDescription>A card that showcases a set of tools that you use to create your product.</CardDescription>
    </Card>
  );
};


