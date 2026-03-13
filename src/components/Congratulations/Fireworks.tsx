import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  exploded: boolean;
  color: string;
  particles: Particle[];
}

const COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF8FE0', '#FFA94D', '#A78BFA', '#38BDF8',
  '#F472B6', '#34D399', '#FBBF24', '#818CF8',
];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createRocket(width: number, height: number): Rocket {
  return {
    x: Math.random() * width * 0.8 + width * 0.1,
    y: height,
    targetY: Math.random() * height * 0.4 + height * 0.1,
    vy: -(4 + Math.random() * 3),
    exploded: false,
    color: randomColor(),
    particles: [],
  };
}

function explodeRocket(rocket: Rocket): void {
  const count = 40 + Math.floor(Math.random() * 30);
  const color = rocket.color;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const speed = 1.5 + Math.random() * 3;
    const maxLife = 40 + Math.random() * 30;
    rocket.particles.push({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      color: Math.random() > 0.3 ? color : randomColor(),
      size: 2 + Math.random() * 2,
    });
  }
  rocket.exploded = true;
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rockets: Rocket[] = [];
    let launchTimer = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Launch first few rockets immediately
    for (let i = 0; i < 3; i++) {
      const r = createRocket(canvas.width, canvas.height);
      r.y = canvas.height - Math.random() * canvas.height * 0.3;
      rockets.push(r);
    }

    function update() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      launchTimer++;
      if (launchTimer > 30 + Math.random() * 40) {
        launchTimer = 0;
        if (rockets.length < 15) {
          rockets.push(createRocket(canvas!.width, canvas!.height));
        }
      }

      for (const rocket of rockets) {
        if (!rocket.exploded) {
          // Draw rocket trail
          ctx!.beginPath();
          ctx!.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
          ctx!.fillStyle = rocket.color;
          ctx!.fill();

          // Trail
          ctx!.beginPath();
          ctx!.moveTo(rocket.x, rocket.y);
          ctx!.lineTo(rocket.x + (Math.random() - 0.5) * 2, rocket.y + 10);
          ctx!.strokeStyle = 'rgba(255,200,100,0.6)';
          ctx!.lineWidth = 1.5;
          ctx!.stroke();

          rocket.y += rocket.vy;

          if (rocket.y <= rocket.targetY) {
            explodeRocket(rocket);
          }
        }

        // Update particles
        for (const p of rocket.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // gravity
          p.vx *= 0.99;
          p.life--;

          const alpha = Math.max(0, p.life / p.maxLife);
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx!.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx!.fill();
        }

        // Remove dead particles
        rocket.particles = rocket.particles.filter(p => p.life > 0);
      }

      // Remove fully spent rockets
      rockets = rockets.filter(r => !r.exploded || r.particles.length > 0);

      animId = requestAnimationFrame(update);
    }

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}
