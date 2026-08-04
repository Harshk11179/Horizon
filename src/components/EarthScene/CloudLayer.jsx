import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { DoubleSide } from 'three';
import './CloudsMaterial';
import { EARTH_RADIUS } from './EarthMesh';

import cloudTexturePath from '@/assets/textures/earth-clouds.png';

const CLOUD_RADIUS = EARTH_RADIUS * 1.012;

/**
 * CloudLayer
 *
 * Deliberately a SIBLING of EarthMesh's internal rotating group, not a
 * child of it — see the comment in EarthMesh.jsx. Rotating at 0.024
 * rad/s against the surface's 0.018 rad/s means clouds drift slowly
 * eastward relative to the continents beneath them, which is the
 * actual visual signature of "independent cloud layer" (if both
 * rotated at the same speed, clouds would appear glued to the surface
 * despite being a technically-separate mesh).
 *
 * sunDirectionRef is read from the SAME ref EarthMesh writes into
 * (passed down from EarthExperience, the shared parent) rather than
 * this component computing its own sun angle — single source of truth
 * for "where is the sun right now," consistent with the reasoning in
 * EarthMesh.jsx's header comment.
 */
export default function CloudLayer({ sunDirectionRef }) {
  const cloudGroupRef = useRef();
  const materialRef = useRef();

  const cloudMap = useTexture(cloudTexturePath);

  useFrame((_, delta) => {
    if (cloudGroupRef.current) {
      cloudGroupRef.current.rotation.y += delta * 0.024;
    }
    if (materialRef.current && sunDirectionRef?.current) {
      materialRef.current.uSunDirection.set(...sunDirectionRef.current);
    }
  });

  return (
    <group ref={cloudGroupRef}>
      <mesh>
        <sphereGeometry args={[CLOUD_RADIUS, 96, 96]} />
        {/* @ts-ignore -- custom shaderMaterial registered via extend() in CloudsMaterial.js */}
        <cloudsMaterial
          ref={materialRef}
          uCloudTexture={cloudMap}
          transparent
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
