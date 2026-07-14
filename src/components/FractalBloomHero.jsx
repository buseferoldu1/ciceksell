import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flower2 } from 'lucide-react';

const FractalBloomCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight };
        let currentDepth = 0;
        const maxDepth = 9;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawBranch = (x, y, angle, length, depth) => {
            if (depth > currentDepth) return;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            ctx.lineTo(endX, endY);
            
            const opacity = 1 - (depth / maxDepth);
            // Deep Forest Green rengi
            ctx.strokeStyle = `rgba(6, 78, 59, ${opacity})`; 
            ctx.lineWidth = 1 - (depth / maxDepth) * 0.5;
            ctx.stroke();

            const distToMouse = Math.hypot(endX - mouse.x, endY - mouse.y);
            const mouseEffect = Math.max(0, 1 - distToMouse / (canvas.height / 2));
            const angleOffset = (Math.PI / 8) * mouseEffect;

            drawBranch(endX, endY, angle - (Math.PI / 10) - angleOffset, length * 0.8, depth + 1);
            drawBranch(endX, endY, angle + (Math.PI / 10) + angleOffset, length * 0.8, depth + 1);
        };

        const animate = () => {
            // Soft Floral White arka plan silinme efekti
            ctx.fillStyle = 'rgba(250, 250, 250, 0.2)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const startX = canvas.width / 2;
            const startY = canvas.height;
            const startLength = canvas.height / 5;
            
            drawBranch(startX, startY, -Math.PI / 2, startLength, 0);
            
            if (currentDepth < maxDepth) {
                currentDepth += 0.05;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        
        resizeCanvas();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full bg-[#FAFAFA]" />;
};

export default function FractalBloomHero() {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.2 + 1.5, duration: 0.8, ease: "easeInOut" },
        }),
    };

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            <FractalBloomCanvas />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-10"></div>

            <div className="relative z-20 flex flex-col items-center text-center px-4">
                <motion.div
                    custom={0} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-900/20 mb-6 backdrop-blur-sm"
                >
                    <Flower2 className="h-4 w-4 text-emerald-700" />
                    <span className="text-sm font-medium text-emerald-800">
                        Premium Çiçek Tasarımları
                    </span>
                </motion.div>

                <motion.h1
                    custom={1} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-6 text-emerald-900"
                >
                    Çiçek Bankası
                </motion.h1>

                <motion.p
                    custom={2} variants={fadeUpVariants} initial="hidden" animate="visible"
                    className="max-w-xl text-lg text-slate-700 mb-8"
                >
                    Sevdiklerinize doğanın zarafetini hediye edin. Aynı gün teslimat seçeneğiyle, en taze aranjmanlar kapınızda.
                </motion.p>

                <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
                    <button className="px-8 py-4 bg-emerald-900 text-white font-semibold rounded-lg shadow-lg hover:bg-emerald-800 transition-colors duration-300 flex items-center gap-2 mx-auto">
                        Koleksiyonu İncele
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}