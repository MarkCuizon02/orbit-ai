import React, { useEffect, useRef } from "react";

export const Orbit3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking for 3D perspective shift
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Generate 3D Particles
    const PARTICLE_COUNT = 180;
    const particles: { x: number; y: number; z: number; baseR: number; color: string; speed: number; angle: number }[] = [];

    const colors = ["#818cf8", "#a78bfa", "#38bdf8", "#34d399", "#f43f5e"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 120 + Math.random() * 80;

      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        baseR: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: (Math.random() - 0.5) * 0.01,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let rotX = 0;
    let rotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      rotY += 0.005 + mouseX * 0.01;
      rotX += 0.002 + mouseY * 0.01;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Center Holographic Core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 160);
      coreGradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");
      coreGradient.addColorStop(0.5, "rgba(168, 85, 247, 0.15)");
      coreGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Draw Outer 3D Rings
      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer Ring 1
      ctx.strokeStyle = "rgba(129, 140, 248, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 180, 70, rotY * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Ring 2
      ctx.strokeStyle = "rgba(167, 139, 250, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 210, 90, -rotX * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Render 3D Particles
      const projected: { x: number; y: number; size: number; alpha: number; color: string; z: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        // Rotate around Y
        let x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        let z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);

        // Rotate around X
        let y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Perspective scale
        const fov = 350;
        const scale = fov / (fov + z2);
        const projX = x1 * scale;
        const projY = y2 * scale;

        const alpha = Math.max(0.1, Math.min(1, (z2 + 200) / 350));

        projected.push({
          x: projX,
          y: projY,
          size: p.baseR * scale,
          alpha,
          color: p.color,
          z: z2,
        });
      }

      // Sort by Z depth
      projected.sort((a, b) => a.z - b.z);

      // Connect near particles with 3D lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j += 4) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - dist / 65) * 0.25 * p1.alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
};
