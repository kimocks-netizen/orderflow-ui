import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

interface Particle {
  x: number; y: number; size: number;
  speedX: number; speedY: number; opacity: number;
}

interface MaskProps { particleCount?: number; }

export default function Mask({ particleCount = 150 }: MaskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: true });
  const isMobile = useRef(false);
  const { isDark } = useThemeStore();
  const isDarkRef = useRef(isDark);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      isMobile.current = window.innerWidth < 1024;
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      const count = isMobile.current ? 60 : particleCount;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isOverInteractive = el !== canvas && el?.closest('nav, button, a, [role="button"], input, select, textarea');
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: !isOverInteractive };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 100) {
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      if (mouseRef.current.active) {
        particlesRef.current.forEach(p => {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          if (Math.sqrt(dx * dx + dy * dy) < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        });
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      particlesRef.current.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark, particleCount]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0" style={{ background: 'transparent' }} />
    </div>
  );
}
