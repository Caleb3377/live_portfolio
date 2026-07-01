import React, { useEffect, useRef } from 'react';

const ScrollCanvas3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D particles representing a neural network or vector database space
    const particleCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      color: string;
    }> = [];

    // Initialize particles in a 3D cylinder/grid shape
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2 * 6; // spiral
      const r = 180 + Math.sin(i * 0.1) * 30;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = (i / particleCount) * 800 - 400; // spread along Y axis

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color: i % 2 === 0 ? '#c084fc' : '#22d3ee', // Purple and Cyan
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const scrollPercent = scrollYRef.current / (document.documentElement.scrollHeight - window.innerHeight || 1);
      
      // Dynamic camera rotation based on scroll (scrubbing effect)
      const angleY = scrollPercent * Math.PI * 4; // 2 full rotations over full scroll
      const angleX = Math.sin(scrollPercent * Math.PI) * 0.5; // slight pitch tilt up and down

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Camera settings
      const fov = 350; // Field of view (perspective factor)
      const cameraZ = 800; // Camera distance

      // Projected points for connection lines
      const projected: Array<{ x: number; y: number; z: number; depth: number; color: string }> = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply scroll-linked warp/dispersion
        const warpFactor = 1 + scrollPercent * 2.5; // push outward as scroll goes down
        let rx = p.baseX * warpFactor;
        let ry = p.baseY;
        let rz = p.baseZ * warpFactor;

        // Apply 3D Y rotation (camera heading)
        let x1 = rx * cosY - rz * sinY;
        let z1 = rx * sinY + rz * cosY;

        // Apply 3D X rotation (camera pitch)
        let y2 = ry * cosX - z1 * sinX;
        let z2 = ry * sinX + z1 * cosX;

        // Perspective projection
        const scale = fov / (fov + z2 + cameraZ);
        const projX = x1 * scale + width / 2;
        const projY = y2 * scale + height / 2;

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          depth: scale,
          color: p.color,
        });

        // Draw particle node
        const size = Math.max(0.5, scale * 3.5);
        const alpha = Math.max(0.05, Math.min(1, scale * 1.5));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(projX, projY, size, 0, Math.PI * 2);
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // Draw connection lines representing neural connections/vectors
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // Connect nearby nodes in the 3D space
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if visual screen distance is small and depths are close
          if (dist < 80 && Math.abs(p1.z - p2.z) < 150) {
            const alpha = (1 - dist / 80) * 0.15 * Math.min(p1.depth, p2.depth);
            ctx.globalAlpha = Math.max(0, alpha);
            
            // Gradient lines between cyan and purple nodes
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color);
            gradient.addColorStop(1, p2.color);
            ctx.strokeStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

export default ScrollCanvas3D;
