import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flip: number;
  flipSpeed: number;
  color: string;
  opacity: number;
  type: 'petal' | 'sparkle';
  life?: number;
  maxLife?: number;
}

export const ParticlesCanvas: React.FC<{
  active: boolean;
  burstTrigger: number;
  goldColor?: string;
}> = ({ active, burstTrigger, goldColor = '#d4af37' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);
  const scrollWindRef = useRef(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || !burstTrigger || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const petalPalette = ['#fdfaf6', '#fef3c7', '#ffffff', '#f5ebe0'];
    const goldPalette = [goldColor, '#fbbf24', '#fef08a', '#d97706'];
    const burst: Particle[] = [];
    for (let i = 0; i < 28; i++) {
      const isSparkle = Math.random() > 0.48;
      burst.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 40,
        size: isSparkle ? 2 + Math.random() * 3 : 7 + Math.random() * 9,
        speedY: 1.2 + Math.random() * 1.7,
        speedX: (Math.random() - 0.5) * 1.5,
        angle: Math.random() * 360,
        angularSpeed: (Math.random() - 0.5) * 1.4,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.03,
        color: isSparkle
          ? goldPalette[Math.floor(Math.random() * goldPalette.length)]
          : petalPalette[Math.floor(Math.random() * petalPalette.length)],
        opacity: 0.78 + Math.random() * 0.22,
        type: isSparkle ? 'sparkle' : 'petal',
        life: 0,
        maxLife: 210 + Math.random() * 80,
      });
    }
    particlesRef.current = [...particlesRef.current, ...burst];
  }, [burstTrigger, goldColor, prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastScrollRef.current;
      lastScrollRef.current = y;
      scrollWindRef.current = Math.min(Math.max(diff * 0.1, -2), 2.5);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const petalPalette = ['#fdfaf6', '#fef3c7', '#ffffff', '#f5ebe0'];
    const goldPalette = [goldColor, '#fbbf24', '#fef08a', '#d97706'];

    const createAmbient = (w: number, h: number, count = 26) => {
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const isSparkle = Math.random() > 0.62;
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: isSparkle ? 1.5 + Math.random() * 2.3 : 5 + Math.random() * 7,
          speedY: isSparkle ? 0.28 + Math.random() * 0.38 : 0.55 + Math.random() * 0.7,
          speedX: (Math.random() - 0.5) * 0.5,
          angle: Math.random() * 360,
          angularSpeed: (Math.random() - 0.5) * 0.7,
          flip: Math.random() * Math.PI,
          flipSpeed: 0.014 + Math.random() * 0.02,
          color: isSparkle
            ? goldPalette[Math.floor(Math.random() * goldPalette.length)]
            : petalPalette[Math.floor(Math.random() * petalPalette.length)],
          opacity: isSparkle ? 0.4 + Math.random() * 0.45 : 0.4 + Math.random() * 0.35,
          type: isSparkle ? 'sparkle' : 'petal',
        });
      }
      return arr;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        particlesRef.current = createAmbient(canvas.width, canvas.height, 26);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (active) {
        scrollWindRef.current *= 0.92;
        const list = particlesRef.current;
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.y += p.speedY + scrollWindRef.current;
          p.x += p.speedX + Math.sin(p.flip) * 0.32;
          p.angle += p.angularSpeed;
          p.flip += p.flipSpeed;

          if (p.life !== undefined && p.maxLife !== undefined) {
            p.life += 1;
            if (p.life > p.maxLife) {
              list.splice(i, 1);
              continue;
            }
          } else {
            if (p.y > canvas.height + 20) {
              p.y = -15;
              p.x = Math.random() * canvas.width;
            }
            if (p.x < -20) p.x = canvas.width + 10;
            if (p.x > canvas.width + 20) p.x = -10;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);

          if (p.type === 'sparkle') {
            const twinkle = 0.45 + 0.55 * Math.sin(p.flip * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity * twinkle;
            ctx.shadowColor = goldColor;
            ctx.shadowBlur = 6;
            const s = p.size;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(0, 0, s, 0);
            ctx.quadraticCurveTo(0, 0, 0, s);
            ctx.quadraticCurveTo(0, 0, -s, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.fill();
          } else {
            const flipScale = Math.sin(p.flip);
            ctx.scale(1, Math.max(Math.abs(flipScale), 0.18));
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.bezierCurveTo(p.size * 0.72, -p.size * 0.5, p.size * 0.72, p.size * 0.5, 0, p.size);
            ctx.bezierCurveTo(-p.size * 0.72, p.size * 0.5, -p.size * 0.72, -p.size * 0.5, 0, -p.size);
            ctx.fill();
          }

          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, goldColor, prefersReduced]);

  if (prefersReduced || !active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full"
      aria-hidden="true"
    />
  );
};
