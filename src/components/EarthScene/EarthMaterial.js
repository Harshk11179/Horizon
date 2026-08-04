import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color, Vector3 } from 'three';

/**
 * EarthMaterial
 *
 * Custom shader handling three things simultaneously, because they're
 * not independent — the day/night blend factor needs to be available
 * to BOTH the color blend (day map vs night-lights map) AND the
 * specular calculation (oceans only show a sun-glint highlight on the
 * day side, not the night side).
 *
 * Uniforms:
 *   uDayTexture    - color map (land/ocean)
 *   uNightTexture  - emissive city-lights map
 *   uNormalTexture - tangent-space normal map for surface relief
 *   uSunDirection  - normalized world-space direction TO the sun.
 *                    Passed in every frame by EarthMesh's useFrame loop
 *                    rather than computed here, since the sun's position
 *                    is shared with the atmosphere shader and the
 *                    directional light itself — single source of truth
 *                    lives in the parent component.
 *   uCloudShadowTexture - the cloud alpha map, sampled a second time
 *                    here (slightly offset) to darken the surface
 *                    beneath clouds — without this, clouds look like a
 *                    flat decal floating above the surface rather than
 *                    something actually casting shadow on it.
 */
const EarthMaterial = shaderMaterial(
  {
    uDayTexture: null,
    uNightTexture: null,
    uNormalTexture: null,
    uCloudShadowTexture: null,
    uSunDirection: new Vector3(1, 0, 0),
    uAtmosphereColor: new Color('#00D9FF'),
    uTime: 0,
  },
  // Vertex shader
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
  // Fragment shader
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
      vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
      vec3 nightColor = texture2D(uNightTexture, vUv).rgb;

      // Perturb the geometric normal using the normal map. This is a
      // simplified world-space perturbation (not full tangent-space
      // TBN matrix construction) — sufficient here because the sphere's
      // UV layout is regular (equirectangular) and the visual target is
      // "subtle relief shading," not accurate lighting for close-up
      // geological inspection.
      vec3 normalSample = texture2D(uNormalTexture, vUv).rgb * 2.0 - 1.0;
      vec3 perturbedNormal = normalize(vNormal + normalSample * 0.15);

      // Day/night terminator: dot product of surface normal and sun
      // direction. 1.0 = facing sun directly, -1.0 = facing directly
      // away. smoothstep gives a soft terminator line instead of a hard
      // day/night edge, which is what makes it read as "planet" rather
      // than "two-tone sphere."
      float sunFacing = dot(perturbedNormal, normalize(uSunDirection));
      float dayNightMix = smoothstep(-0.15, 0.15, sunFacing);

      // Cloud shadow: sample the cloud alpha map, darken the surface
      // color proportionally where clouds are dense. Slight UV offset
      // in the sample simulates clouds sitting slightly above the
      // surface catching light at a grazing angle rather than shadow
      // sitting exactly beneath — subtle, but avoids a "decal" look.
      float cloudDensity = texture2D(uCloudShadowTexture, vUv + vec2(0.002, 0.0)).a;
      float cloudShadow = 1.0 - cloudDensity * 0.4;

      vec3 litDayColor = dayColor * cloudShadow;

      // Ocean specular: cheap approximation — day map's ocean pixels are
      // blue-dominant (see generateTextures.js color palette), so use
      // "blueness" as a mask for where specular highlight should apply,
      // avoiding a full separate specular/roughness texture map for
      // this level of fidelity.
      float oceanMask = smoothstep(0.15, 0.35, dayColor.b - dayColor.r);
      vec3 viewDir = normalize(vViewPosition);
      vec3 halfDir = normalize(normalize(uSunDirection) + viewDir);
      float specAngle = max(dot(perturbedNormal, halfDir), 0.0);
      float specular = pow(specAngle, 48.0) * oceanMask * dayNightMix;

      vec3 finalColor = mix(nightColor, litDayColor, dayNightMix);
      finalColor += vec3(1.0, 0.95, 0.85) * specular * 0.6;

      // Rim light using the atmosphere color — a faint edge glow where
      // the surface normal grazes the view direction, tying the
      // planet's edge visually to the separate atmosphere shell mesh
      // rather than having a hard seam between the two.
      float rim = 1.0 - max(dot(perturbedNormal, viewDir), 0.0);
      rim = pow(rim, 3.0) * dayNightMix * 0.15;
      finalColor += uAtmosphereColor * rim;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ EarthMaterial });

export default EarthMaterial;
