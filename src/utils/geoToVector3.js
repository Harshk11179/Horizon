import { Vector3 } from 'three';

/**
 * Converts a latitude/longitude pair into a Vector3 position on the
 * surface of a sphere of the given radius, using the standard
 * spherical-to-Cartesian conversion.
 *
 * Longitude offset note: Three.js's default sphere UV mapping (as used
 * by SphereGeometry + a standard equirectangular Earth texture) has its
 * texture seam at longitude 180°/-180°, with the texture's front-facing
 * center at longitude 0° along -Z. The `+ 90` on the phi calculation
 * corrects for this so a marker at (lat, lng) = (0, 0) — the Gulf of
 * Guinea, off the coast of West Africa — lands on the correct visible
 * point of a standard NASA Blue Marble equirectangular texture rather
 * than 90° rotated from it. This was verified against the six country
 * centroids in locations.json during initial marker placement.
 *
 * @param {number} lat - latitude in degrees, -90 to 90
 * @param {number} lng - longitude in degrees, -180 to 180
 * @param {number} radius - sphere radius the marker should sit on
 * @returns {Vector3}
 */
export function geoToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 90) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}

/**
 * Given a target lat/lng on the globe, returns a camera position that
 * sits `distance` units away from the sphere's center, along the ray
 * from center through that surface point — i.e. "hovering above" that
 * location, facing it. Used for the marker-click fly-to camera
 * animation.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {number} radius - the globe's radius (surface point reference)
 * @param {number} distance - how far above the surface the camera sits
 */
export function geoToCameraPosition(lat, lng, radius, distance) {
  const surfacePoint = geoToVector3(lat, lng, radius);
  return surfacePoint.clone().normalize().multiplyScalar(radius + distance);
}
