import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color, Vector3, AdditiveBlending, BackSide } from 'three';

const AtmosphereMaterial = shaderMaterial(
  {
    uSunDirection: new Vector3(1, 0, 0),
    uDayColor: new Color('#00D4FF'),
    uNightColor: new Color('#001A3D'),
    uGlowColor: new Color('#0044AA'),
    uIntensity: 1.0,
  },
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
  /* glsl */ `
    uniform vec3 uSunDirection;
    uniform vec3 uDayColor;
    uniform vec3 uNightColor;
    uniform vec3 uGlowColor;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 norm    = normalize(vNormal);

      // Tighter Fresnel for a sharper, more cinematic limb glow
      float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.2);

      // Day/night atmospheric tint
      float sunFacing  = dot(norm, normalize(uSunDirection));
      float dayMix     = smoothstep(-0.5, 0.25, sunFacing);
      vec3 atmColor    = mix(uNightColor, uDayColor, dayMix);

      // Secondary deep-blue inner glow — gives sense of thick atmosphere
      float innerGlow  = pow(1.0 - max(dot(norm, viewDir), 0.0), 1.6) * 0.3;
      atmColor         = mix(atmColor, uGlowColor, innerGlow * (1.0 - dayMix));

      // Very subtle rayleigh-style scatter: blue fringe on the sun side
      float scatter    = max(sunFacing, 0.0) * 0.12;
      atmColor         += vec3(0.0, 0.12, 0.3) * scatter * fresnel;

      float alpha = fresnel * uIntensity;
      gl_FragColor = vec4(atmColor, alpha);
    }
  `
);

extend({ AtmosphereMaterial });

export const ATMOSPHERE_MATERIAL_PROPS = {
  side: BackSide,
  blending: AdditiveBlending,
  transparent: true,
  depthWrite: false,
};

export default AtmosphereMaterial;
