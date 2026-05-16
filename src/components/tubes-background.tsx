"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

interface TubesBackgroundProps {
  children?: React.ReactNode;
}

export default function TubesBackground({ children }: TubesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create elegant, thin tubes
    const tubes: THREE.Mesh[] = [];
    const tubeCount = 8;

    for (let i = 0; i < tubeCount; i++) {
      // Create smooth flowing curves positioned around the edges
      const points: THREE.Vector3[] = [];
      const segments = 6;
      const angle = (i / tubeCount) * Math.PI * 2;
      const radius = 35 + Math.random() * 15;
      
      for (let j = 0; j < segments; j++) {
        const t = j / (segments - 1);
        const x = Math.cos(angle + t * 0.5) * radius + (Math.random() - 0.5) * 10;
        const y = (t - 0.5) * 80 + (Math.random() - 0.5) * 10;
        const z = Math.sin(angle + t * 0.5) * 20 - 30 + (Math.random() - 0.5) * 10;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 100, 0.15, 8, false);
      
      // Softer yellow/gold with glow effect
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf5c842),
        transparent: true,
        opacity: 0.4 + Math.random() * 0.2,
      });

      const tube = new THREE.Mesh(geometry, material);
      tubes.push(tube);
      scene.add(tube);
    }

    // Add subtle glow particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 40;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 30;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xf5c842,
      size: 0.3,
      transparent: true,
      opacity: 0.3,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Very slow, subtle rotation
      tubes.forEach((tube, i) => {
        tube.rotation.y += 0.0005 * (i % 2 === 0 ? 1 : -1);
      });

      // Gentle camera movement based on mouse
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 3 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      particles.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">{children}</div>
    </div>
  );
}