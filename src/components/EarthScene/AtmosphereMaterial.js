import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color, Vector3, AdditiveBlending, BackSide } from 'three';

/**
 * AtmosphereMaterial
 *
 * Classic Fresnel rim-glow technique: render a sphere slightly larger
 * than the Earth mesh, with BackSide culling (so we see the INSIDE of
 * this larger sphere from outside the Earth) and additive blending.
 * The Fresnel term makes opacity near-zero when looking straight at the
 * surface (view direction parallel to normal) and near-1 at grazing
 * angles (view direction perpendicular to normal) — which is exactly
 * how atmospheric scattering behaves: you see more atmosphere glow
 * looking through it at a shallow angle (toward the limb/edge of the
 * planet) than looking straight down through it.
 *
 * uSunDirection is reused here (same value as EarthMaterial's uniform)
 * so the glow subtly warms/dims on the day side vs night side rather
 * than being a uniform ring regardless of lighting — the aurora effect
 * is a SEPARATE mesh (see AuroraEffect.jsx), this shader only handles
 * the general atmospheric rim glow.
 */
const AtmosphereMaterial = shaderMaterial(
  {
    uSunDirection: new Vector3(1, 0, 0),
    uDayColor: new Color('#00D9FF'),
    uNightColor: new Color('#003A4D'),
    uIntensity: 1.0,
  },
  // Vertex shader
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform vec3 uSunDirection;
    uniform vec3 uDayColor;
    uniform vec3 uNightColor;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel term: 0 at normal incidence, 1 at grazing angle.
      // Power of 2.5 (rather than a lower power like 1.0) gives a
      // tighter, more concentrated rim rather than a glow that fades
      // too gradually across the whole visible hemisphere.
      float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.5);

      // Blend atmosphere tint based on how much this point on the
      // sphere faces the sun — same day/night logic as the surface
      // shader, but softer since atmospheric scattering doesn't have a
      // hard terminator the way direct surface lighting does.
      float sunFacing = dot(normalize(vNormal), normalize(uSunDirection));
      float dayNightMix = smoothstep(-0.4, 0.3, sunFacing);
      vec3 atmosphereColor = mix(uNightColor, uDayColor, dayNightMix);

      gl_FragColor = vec4(atmosphereColor, fresnel * uIntensity);
    }
  `
);

extend({ AtmosphereMaterial });

// Exported alongside the material so EarthMesh can apply the correct
// side/blending mode without needing to remember these constants itself.
export const ATMOSPHERE_MATERIAL_PROPS = {
  side: BackSide,
  blending: AdditiveBlending,
  transparent: true,
  depthWrite: false,
};

export default AtmosphereMaterial;
