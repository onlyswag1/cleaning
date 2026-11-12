"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

type CategoryId = "sofa" | "armchair" | "mattress" | "chair" | "other";

export function SofaModel({ category }: { category: CategoryId }) {
  const modelPath = useMemo(() => {
    if (category === "sofa") return "/sofa.glb";
    if (category === "armchair") return "/armchair.glb";
    if (category === "mattress") return "/mattress.glb";
    if (category === "chair") return "/chair.glb";
    return null;
  }, [category]);

  if (!modelPath) return null;
  return <ModelRenderer path={modelPath} />;
}

function ModelRenderer({ path }: { path: string }) {
  const { scene } = useGLTF(path);

  useEffect(() => {
    // 1. Полный сброс (никаких поворотов!)
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    // 2. Тени
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // 3. Центрирование (чтобы модель была по центру сцены)
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    scene.position.x = -center.x;
    scene.position.z = -center.z;

    // 4. Масштабирование (если модель огромная, уменьшаем)
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 10) {
      const scale = 3 / maxDim;
      scene.scale.set(scale, scale, scale);
    }

    // 5. Постановка на пол
    const newBox = new THREE.Box3().setFromObject(scene);
    scene.position.y = -newBox.min.y;

  }, [scene]);

  return <primitive object={scene} />;
}