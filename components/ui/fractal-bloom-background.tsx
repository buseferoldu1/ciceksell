"use client";

import { useEffect, useRef } from "react";

// Koyu temali 2. sayfa (vitrin) icin atmosferik, imlecle hareket eden
// fraktal dallar. Metin/rozet yok; yalnizca arka plan katmani.
export default function FractalBloomBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hareket azaltma tercihine saygi: animasyon yerine tek kare ciz
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight };
    let currentDepth = 0;
    // 2^depth dal cizildigi icin derinlik dusurmek maliyeti ustel azaltir
    const maxDepth = 8;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawBranch = (
      x: number,
      y: number,
      angle: number,
      length: number,
      depth: number
    ) => {
      if (depth > currentDepth) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      ctx.lineTo(endX, endY);

      const opacity = 1 - depth / maxDepth;
      // Lüks gül kurusu (rose gold) tonu — koyu zeminde yumuşak parıltı
      ctx.strokeStyle = `rgba(246, 182, 190, ${opacity * 0.35})`;
      ctx.lineWidth = 1 - (depth / maxDepth) * 0.5;
      ctx.stroke();

      const distToMouse = Math.hypot(endX - mouse.x, endY - mouse.y);
      const mouseEffect = Math.max(0, 1 - distToMouse / (canvas.height / 2));
      const angleOffset = (Math.PI / 8) * mouseEffect;

      drawBranch(endX, endY, angle - Math.PI / 10 - angleOffset, length * 0.8, depth + 1);
      drawBranch(endX, endY, angle + Math.PI / 10 + angleOffset, length * 0.8, depth + 1);
    };

    const cizKare = () => {
      // Obsidyen zemin izini silme efekti
      ctx.fillStyle = "rgba(19, 19, 20, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startX = canvas.width / 2;
      const startY = canvas.height;
      const startLength = canvas.height / 5;

      drawBranch(startX, startY, -Math.PI / 2, startLength, 0);

      if (currentDepth < maxDepth) currentDepth += 0.06;
    };

    // ~30 FPS'e sinirla (60'ta gereksiz CPU yakiyordu) + sekme gizliyken dur
    const FRAME_MS = 1000 / 30;
    let sonKare = 0;
    const animate = (t: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;
      if (t - sonKare < FRAME_MS) return;
      sonKare = t;
      cizKare();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    if (reduceMotion) {
      // Statik tek kare: agacin tam acilmis hali, animasyon yok
      currentDepth = maxDepth;
      cizKare();
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
