import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Vector3 } from 'three';

/**
 * CloudsMaterial
 *
 * Rendered on its own sphere, radius slightly larger than the Earth
 * surface mesh, rotating independently (see CloudLayer.jsx — different
 * rotation speed than the surface, which is what makes clouds read as
 * a distinct atmospheric layer rather than a texture baked into the
 * planet itself).
 *
 * Day/night response: clouds are lit by the sun same as the surface —
 * bright white on the day side, and dimmed (not fully black, since real
 * clouds catch some ambient/scattered light even on the night side and
 * a fully-black cloud layer against a lit night-side city map looks
 * like a rendering error) on the night side.
 */
const CloudsMaterial = shaderMaterial(
  {
    uCloudTexture: null,
    uSunDirection: new Vector3(1, 0, 0),
  },
  // Vertex shader
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform sampler2D uCloudTexture;
    uniform vec3 uSunDirection;

    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float alpha = texture2D(uCloudTexture, vUv).a;

      float sunFacing = dot(normalize(vNormal), normalize(uSunDirection));
      float lightAmount = smoothstep(-0.3, 0.2, sunFacing);
      // Floor of 0.12 rather than 0.0 — night-side clouds stay faintly
      // visible instead of vanishing completely, matching how real
      // night-side cloud cover is still visible (dimly, via scattered
      // moonlight/starlight) rather than pure black.
      float brightness = mix(0.12, 1.0, lightAmount);

      vec3 color = vec3(brightness);
      gl_FragColor = vec4(color, alpha * 0.85);
    }
  `
);

extend({ CloudsMaterial });

export default CloudsMaterial;
