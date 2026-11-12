"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { SofaModel } from "./SofaModel";
import { Suspense } from "react";

type CategoryId = "sofa" | "armchair" | "mattress" | "chair" | "other";

type SofaSceneProps = {
  category: CategoryId;
};

export function SofaScene({ category }: SofaSceneProps) {
  // Настраиваем камеру в зависимости от категории
  const getCameraSettings = () => {
    if (category === "mattress") {
      // Для матраса смотрим строго сверху
      return { position: [0, 6, 0.1] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    }
    if (category === "armchair" || category === "chair") {
      // Для кресла и стула чуть ближе
      return { position: [3, 3, 4] as [number, number, number], target: [0, 1, 0] as [number, number, number] };
    }
    // Для дивана стандартная
    return { position: [-4, 4, -4] as [number, number, number], target: [0, 1.5, 0] as [number, number, number] };
  };

  const cam = getCameraSettings();

  return (
    <div className="h-full w-full">
      {/* key={category} заставляет Canvas пересоздаться при смене категории, чтобы камера встала на место */}
      <Canvas 
        key={category}
        shadows 
        camera={{ position: cam.position, fov: 45, near: 0.1, far: 1000 }}
      >
        <color attach="background" args={["#1C2128"]} />

        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <SofaModel category={category} />
          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />
        </Suspense>

        <OrbitControls 
          makeDefault
          enableDamping={false}
          target={cam.target} 
          enablePan={false} 
          minDistance={2} 
          maxDistance={12} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  );
}