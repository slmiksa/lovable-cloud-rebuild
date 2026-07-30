import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Subtle interactive cyber / network background.
 * Nodes drift slowly, connect with thin lines, and react to the mouse pointer.
 */
export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const brand = "31, 179, 180";

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = width < 640 ? 16000 : 22000;
      const count = Math.min(70, Math.max(18, Math.round((width * height) / density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = width < 640 ? 110 : 150;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const radius = 130;
          if (d2 < radius * radius && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / radius) * 0.6;
            n.vx += (dx / d) * force * 0.12;
            n.vy += (dy / d) * force * 0.12;
          }
        }

        // gentle damping so pushes settle back to a calm drift
        n.vx *= 0.99;
        n.vy *= 0.99;
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > 1.6) {
          n.vx = (n.vx / speed) * 1.6;
          n.vy = (n.vy / speed) * 1.6;
        }
        if (speed < 0.05) {
          n.vx += (Math.random() - 0.5) * 0.04;
          n.vy += (Math.random() - 0.5) * 0.04;
        }

        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(${brand}, ${(1 - d / linkDist) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${brand}, 0.42)`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top + window.scrollY - (window.scrollY + rect.top - rect.top);
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      build();
    };

    build();
    if (!reduce) raf = requestAnimationFrame(draw);
    else draw();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--brand)_9%,transparent),transparent_55%),radial-gradient(circle_at_85%_70%,color-mix(in_oklab,var(--brand)_7%,transparent),transparent_50%)]" />
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
    </div>
  );
}
