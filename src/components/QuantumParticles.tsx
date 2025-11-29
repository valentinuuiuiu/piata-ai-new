'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

// Create circular texture for star points
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Star functions - each star represents a blockchain operation
type StarFunction = 'listing' | 'transaction' | 'nft' | 'contract' | 'node';

interface StarData {
  position: [number, number, number];
  function: StarFunction;
  color: THREE.Color;
  data?: any;
}

function StardustField() {
  const particlesRef = useRef<THREE.Points>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const particlesCount = 8000;

  const starFunctions: StarFunction[] = ['listing', 'transaction', 'nft', 'contract', 'node'];

  const functionColors = {
    listing: new THREE.Color('#00ff88'),    // Green - active listings
    transaction: new THREE.Color('#00f0ff'), // Cyan - transactions
    nft: new THREE.Color('#ff00f0'),        // Magenta - NFTs
    contract: new THREE.Color('#ffaa00'),   // Orange - smart contracts
    node: new THREE.Color('#ffffff')        // White - blockchain nodes
  };

  const [positions, colors, starData] = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const starData: StarData[] = [];
    
    // Use a seeded random approach for consistency
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Scattered stardust cloud
      const x = (random(i) - 0.5) * 80;
      const y = (random(i + 1000) - 0.5) * 50;
      const z = (random(i + 2000) - 0.5) * 60;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Assign random function to each star
      const funcIndex = Math.floor(random(i + 3000) * starFunctions.length);
      const func = starFunctions[funcIndex];
      const color = functionColors[func];

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      starData.push({
        position: [x, y, z],
        function: func,
        color,
        data: { id: i, type: func }
      });
    }

    return [positions, colors, starData];
  }, [starFunctions, functionColors]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      // Gentle floating like sand in water
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];

        // Soft undulating motion
        positions[i3] = x + Math.sin(time * 0.1 + y * 0.01) * 0.005;
        positions[i3 + 1] = y + Math.cos(time * 0.15 + x * 0.01) * 0.003;
        positions[i3 + 2] = z + Math.sin(time * 0.12 + x * 0.01) * 0.004;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      // Very slow rotation
      particlesRef.current.rotation.y = time * 0.02;
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // Find nearest star on hover
    const index = Math.floor(e.index || 0);
    setHoveredStar(index);
  };

  return (
    <>
      <points
        ref={particlesRef}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredStar(null)}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesCount}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particlesCount}
            array={colors}
            itemSize={3}
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0}
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={createCircleTexture()}
        />
      </points>

      {/* Tooltip for hovered star */}
      {hoveredStar !== null && (
        <mesh position={[
          positions[hoveredStar * 3],
          positions[hoveredStar * 3 + 1] + 2,
          positions[hoveredStar * 3 + 2]
        ]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color={starData[hoveredStar].color}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </>
  );
}

export default function QuantumParticles() {
  return (
    <div className="fixed inset-0 -z-20 opacity-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 35], fov: 75 }}>
        <StardustField />
      </Canvas>
    </div>
  );
}
