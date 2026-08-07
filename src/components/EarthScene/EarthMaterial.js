import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color, Vector3 } from 'three';

const EarthMaterial = shaderMaterial(
  {
    uDayTexture: null,
    uNightTexture: null,
    uNormalTexture: null,
    uCloudShadowTexture: null,
    uSunDirection: new Vector3(1, 0, 0),
    uAtmosphereColor: new Color('#00D4FF'),
    uTime: 0,
  },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl */ `
    uniform sampler2D uDayTexture;
    uniform sampler2D uNightTexture;
    uniform sampler2D uNormalTexture;
    uniform sampler2D uCloudShadowTexture;
    uniform vec3 uSunDirection;
    uniform vec3 uAtmosphereColor;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vec3 dayColor   = texture2D(uDayTexture,   vUv).rgb;
      vec3 nightColor = texture2D(uNightTexture,  vUv).rgb;
      vec3 normalSample = texture2D(uNormalTexture, vUv).rgb * 2.0 - 1.0;
      vec3 perturbedNormal = normalize(vNormal + normalSample * 0.18);

      vec3 sunDir = normalize(uSunDirection);
      float sunFacing = dot(perturbedNormal, sunDir);

      // Tighter, more cinematic terminator — thinned soft zone so the
      // day/night boundary reads as a precise atmospheric shadow line.
      float dayNightMix = smoothstep(-0.06, 0.10, sunFacing);

      // Cloud shadow
      float cloudDensity = texture2D(uCloudShadowTexture, vUv + vec2(0.0015, 0.0)).a;
      float cloudShadow  = 1.0 - cloudDensity * 0.45;

      vec3 litDayColor = dayColor * cloudShadow;

      // Enhanced diffuse — lambertian + slight fill light on shadow side
      float diffuse     = max(sunFacing, 0.0);
      float fillLight   = max(-sunFacing * 0.04, 0.0); // very subtle bounce from space
      litDayColor       = litDayColor * (0.82 + diffuse * 0.22) + fillLight;

      // Premium ocean specular — sharper highlight with warm tint
      float oceanMask = smoothstep(0.1, 0.32, dayColor.b - dayColor.r);
      vec3  viewDir   = normalize(vViewPosition);
      vec3  halfDir   = normalize(sunDir + viewDir);
      float specAngle = max(dot(perturbedNormal, halfDir), 0.0);
      float specular  = pow(specAngle, 96.0) * oceanMask * dayNightMix;
      // Secondary broader highlight for wet sheen
      float specular2 = pow(specAngle, 18.0) * oceanMask * dayNightMix * 0.06;

      // City lights — boosted and warmer on the night side, fading
      // precisely at the terminator so they don't bleed into daylight.
      float nightMask = 1.0 - dayNightMix;
      float cityBrightness = 1.0 + nightMask * 1.4; // amplify glow
      vec3 boostedNight = nightColor * cityBrightness;

      vec3 finalColor = mix(boostedNight, litDayColor, dayNightMix);

      // Warm specular highlight (sun-glint on ocean)
      finalColor += vec3(1.0, 0.96, 0.82) * specular  * 0.9;
      finalColor += vec3(0.9, 0.95, 1.0)  * specular2;

      // Subtle chromatic Fresnel rim — ties planet edge to atmosphere
      float rim = 1.0 - max(dot(perturbedNormal, viewDir), 0.0);
      rim = pow(rim, 2.8) * 0.18;
      // Day side: warm cyan; night side: deeper indigo tint
      vec3 rimColor = mix(vec3(0.0, 0.15, 0.35), uAtmosphereColor, dayNightMix);
      finalColor += rimColor * rim;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ EarthMaterial });
export default EarthMaterial;
