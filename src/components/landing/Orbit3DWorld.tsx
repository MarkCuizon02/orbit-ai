import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Orbit3DWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2800
    );
    camera.position.set(0, 0, 1150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x818cf8, 3.5, 1200);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3, 1100);
    goldLight.position.set(350, 250, 450);
    scene.add(goldLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 1000);
    cyanLight.position.set(-350, -250, 350);
    scene.add(cyanLight);

    // 3. Central 3D Orbit AI Planet Core (Slightly reduced size for optimal background clearance)
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Core Sphere
    const coreGeo = new THREE.SphereGeometry(90, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x090a16,
      roughness: 0.22,
      metalness: 0.85,
      wireframe: false,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    planetGroup.add(coreMesh);

    // Wireframe Outer Layer
    const wireGeo = new THREE.SphereGeometry(96, 36, 36);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    planetGroup.add(wireMesh);

    // Atmosphere Glow
    const atmosGeo = new THREE.SphereGeometry(110, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    planetGroup.add(atmosMesh);

    // 4. Concentric 3D Orbital Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Ring 1 - Inner Indigo
    const ring1Geo = new THREE.TorusGeometry(175, 2.2, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    // Ring 2 - Outer Gold
    const ring2Geo = new THREE.TorusGeometry(260, 1.8, 16, 140);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    ringGroup.add(ring2);

    // Ring 3 - Distant Cyan Wire
    const ring3Geo = new THREE.TorusGeometry(370, 1.0, 16, 140);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 6;
    ringGroup.add(ring3);

    // 5. Orbiting AI Satellites / Nodes
    const satelliteCount = 10;
    const satellites: THREE.Mesh[] = [];
    const satGroup = new THREE.Group();
    scene.add(satGroup);

    const satGeo = new THREE.OctahedronGeometry(13);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });

    for (let i = 0; i < satelliteCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      const angle = (i / satelliteCount) * Math.PI * 2;
      const radius = 260 + Math.random() * 90;
      sat.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 120,
        Math.sin(angle) * radius
      );
      satellites.push(sat);
      satGroup.add(sat);
    }

    // 6. Deep Cosmic 3D Particle Starfield with Soft Glow & Mouse Interactivity
    const PARTICLE_COUNT = 3500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    const colorPalette = [
      new THREE.Color(0x818cf8), // Indigo
      new THREE.Color(0xa78bfa), // Violet
      new THREE.Color(0xf59e0b), // Gold
      new THREE.Color(0x38bdf8), // Cyan
      new THREE.Color(0xf43f5e), // Rose
      new THREE.Color(0xffffff), // Pure White
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 3400;
      const y = (Math.random() - 0.5) * 3400;
      const z = (Math.random() - 0.5) * 3400;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    // Custom Canvas Texture for glowing soft particles
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.25, "rgba(167, 139, 250, 0.8)");
        gradient.addColorStop(0.55, "rgba(99, 102, 241, 0.3)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const particleMat = new THREE.PointsMaterial({
      size: 4.5,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // 6b. Foreground Floating Bokeh Dust Particles (Near Camera)
    const FG_COUNT = 220;
    const fgGeo = new THREE.BufferGeometry();
    const fgPositions = new Float32Array(FG_COUNT * 3);
    const fgBasePositions = new Float32Array(FG_COUNT * 3);
    const fgColors = new Float32Array(FG_COUNT * 3);

    for (let i = 0; i < FG_COUNT; i++) {
      const x = (Math.random() - 0.5) * 1600;
      const y = (Math.random() - 0.5) * 1200;
      const z = 200 + Math.random() * 950; // In front of main core

      fgPositions[i * 3] = x;
      fgPositions[i * 3 + 1] = y;
      fgPositions[i * 3 + 2] = z;

      fgBasePositions[i * 3] = x;
      fgBasePositions[i * 3 + 1] = y;
      fgBasePositions[i * 3 + 2] = z;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      fgColors[i * 3] = c.r;
      fgColors[i * 3 + 1] = c.g;
      fgColors[i * 3 + 2] = c.b;
    }

    fgGeo.setAttribute("position", new THREE.BufferAttribute(fgPositions, 3));
    fgGeo.setAttribute("color", new THREE.BufferAttribute(fgColors, 3));

    const fgMat = new THREE.PointsMaterial({
      size: 8.0,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const fgDust = new THREE.Points(fgGeo, fgMat);
    scene.add(fgDust);

    // 7. Mouse Interactivity Variables & 3D Ray Projection
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseSpeed = 0;

    const mouseWorldVector = new THREE.Vector3();

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      const dx = targetMouseX - prevMouseX;
      const dy = targetMouseY - prevMouseY;
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 45, 12);

      prevMouseX = targetMouseX;
      prevMouseY = targetMouseY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // 8. GSAP SCROLLTRIGGER CINEMATIC 3D SEQUENCE
    // Animated properties manipulated by GSAP ScrollTrigger
    const worldProps = {
      camX: 0,
      camY: 0,
      camZ: 1150,
      lookAtX: 0,
      lookAtY: 0,
      lookAtZ: 0,
      planetScale: 0.9,
      planetRotX: 0,
      planetRotY: 0,
      planetRotZ: 0,
      ringRotX: 0,
      ringRotY: 0,
      ringRotZ: 0,
      coreLightIntensity: 3.5,
      wireOpacity: 0.25,
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // Ultra smooth inertial scrolling synchronization
      },
    });

    // SEQUENCE 1 (Hero -> Features 0% to 25% Scroll):
    // Pan camera left & up, rotate planet core dramatically in background
    timeline.to(worldProps, {
      camX: -420,
      camY: 220,
      camZ: 950,
      lookAtX: 60,
      lookAtY: -40,
      planetScale: 1.05,
      planetRotY: Math.PI * 0.8,
      planetRotX: Math.PI * 0.25,
      ringRotZ: Math.PI * 0.5,
      coreLightIntensity: 4.5,
      duration: 1,
      ease: "power2.inOut",
    });

    // SEQUENCE 2 (Features -> 4K AI Video & Neural Showcase 25% to 55% Scroll):
    // Smooth camera shift to right, keeping planet core safely behind UI
    timeline.to(worldProps, {
      camX: 380,
      camY: -150,
      camZ: 800,
      lookAtX: -50,
      lookAtY: 30,
      planetScale: 1.15,
      planetRotY: Math.PI * 1.8,
      planetRotX: -Math.PI * 0.3,
      planetRotZ: Math.PI * 0.2,
      ringRotX: Math.PI * 0.5,
      ringRotY: Math.PI * 0.4,
      coreLightIntensity: 5.5,
      wireOpacity: 0.4,
      duration: 1,
      ease: "power2.inOut",
    });

    // SEQUENCE 3 (4K AI Video -> Chaos vs Harmony Transformation 55% to 80% Scroll):
    // Cinematic high-angle tilt perspective with spinning orbital rings
    timeline.to(worldProps, {
      camX: 0,
      camY: 480,
      camZ: 1000,
      lookAtX: 0,
      lookAtY: -100,
      planetScale: 0.95,
      planetRotY: Math.PI * 2.8,
      planetRotX: Math.PI * 0.6,
      ringRotZ: Math.PI * 1.8,
      ringRotY: -Math.PI * 0.5,
      coreLightIntensity: 4.0,
      wireOpacity: 0.3,
      duration: 1,
      ease: "power2.inOut",
    });

    // SEQUENCE 4 (Pricing -> Final CTA Warp Drive 80% to 100% Scroll):
    // Warp-drive forward acceleration while staying safely behind DOM overlay
    timeline.to(worldProps, {
      camX: 0,
      camY: 0,
      camZ: 650,
      lookAtX: 0,
      lookAtY: 0,
      planetScale: 1.2,
      planetRotY: Math.PI * 4.0,
      planetRotX: Math.PI * 1.0,
      ringRotZ: Math.PI * 3.0,
      coreLightIntensity: 6.5,
      wireOpacity: 0.5,
      duration: 1,
      ease: "power3.inOut",
    });

    // 9. Render Animation Loop
    let lastTime = performance.now();
    let startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      // Mouse Lerp & Speed dampening
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      mouseSpeed *= 0.94;

      // Calculate approximate 3D mouse vector in scene space
      mouseWorldVector.set(mouseX * 650, -mouseY * 480, 450);

      // Interactive Particle Physics for main Starfield
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const radius = 350;
      const forceStrength = 140 + mouseSpeed * 25;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const bx = basePositions[idx];
        const by = basePositions[idx + 1];
        const bz = basePositions[idx + 2];

        const px = positions[idx];
        const py = positions[idx + 1];
        const pz = positions[idx + 2];

        const dx = px - mouseWorldVector.x;
        const dy = py - mouseWorldVector.y;
        const dz = pz - mouseWorldVector.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < radius && dist > 1) {
          const factor = (1 - dist / radius) * (forceStrength / dist);
          positions[idx] += dx * factor * 0.06;
          positions[idx + 1] += dy * factor * 0.06;
          positions[idx + 2] += dz * factor * 0.06;
        }

        // Spring restoration back to base starfield initial positions
        positions[idx] += (bx - positions[idx]) * 0.05;
        positions[idx + 1] += (by - positions[idx + 1]) * 0.05;
        positions[idx + 2] += (bz - positions[idx + 2]) * 0.05;
      }
      posAttr.needsUpdate = true;

      // Interactive Foreground Bokeh Dust float & mouse parallax
      const fgPosAttr = fgGeo.attributes.position as THREE.BufferAttribute;
      const fgPositionsArr = fgPosAttr.array as Float32Array;

      for (let i = 0; i < FG_COUNT; i++) {
        const idx = i * 3;
        const bx = fgBasePositions[idx];
        const by = fgBasePositions[idx + 1];

        // Organic floating drift + reactive camera parallax shift
        fgPositionsArr[idx] = bx + Math.sin(elapsedTime * 0.7 + i) * 30 + mouseX * 140;
        fgPositionsArr[idx + 1] = by + Math.cos(elapsedTime * 0.5 + i) * 30 - mouseY * 140;
      }
      fgPosAttr.needsUpdate = true;

      // Apply GSAP-controlled 3D transforms with mouse parallax offset
      camera.position.set(
        worldProps.camX + mouseX * 50,
        worldProps.camY - mouseY * 50,
        worldProps.camZ
      );
      camera.lookAt(
        worldProps.lookAtX + mouseX * 20,
        worldProps.lookAtY - mouseY * 20,
        worldProps.lookAtZ
      );

      // Continuous ambient rotation added on top of GSAP scroll targets
      planetGroup.scale.set(worldProps.planetScale, worldProps.planetScale, worldProps.planetScale);
      planetGroup.rotation.x = worldProps.planetRotX + elapsedTime * 0.08;
      planetGroup.rotation.y = worldProps.planetRotY + elapsedTime * 0.12;
      planetGroup.rotation.z = worldProps.planetRotZ;

      wireMesh.material.opacity = worldProps.wireOpacity;

      ringGroup.rotation.x = worldProps.ringRotX;
      ringGroup.rotation.y = worldProps.ringRotY + elapsedTime * 0.05;
      ringGroup.rotation.z = worldProps.ringRotZ + elapsedTime * 0.1;

      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.z = -elapsedTime * 0.12;

      satGroup.rotation.y = elapsedTime * 0.25;
      satellites.forEach((sat, idx) => {
        sat.rotation.x = elapsedTime * 0.4 + idx;
        sat.rotation.y = elapsedTime * 0.2;
      });

      starfield.rotation.y = elapsedTime * 0.015;

      // Lights & Atmosphere
      coreLight.intensity = worldProps.coreLightIntensity + Math.sin(elapsedTime * 3) * 0.8;
      goldLight.position.x = 350 + Math.cos(elapsedTime) * 120;
      cyanLight.position.y = -250 + Math.sin(elapsedTime) * 120;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Kill ScrollTrigger instance cleanly
      timeline.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};
