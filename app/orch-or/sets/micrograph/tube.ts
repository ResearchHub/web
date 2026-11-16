import * as THREE from 'three';
import { MT, type Site } from './sem';

// Scratch objects for per-frame matrix writes.
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const p = new THREE.Vector3();
const sc = new THREE.Vector3();
const zAxis = new THREE.Vector3(0, 0, 1);
const col = new THREE.Color();

export interface TubeWrite {
  sites: Site[];
  /** Added to every site's z (to centre the tube, for example). */
  zOffset?: number;
  /** Rotation of the lattice about its own axis. */
  spin?: number;
  /** Sideways (local y) displacement as a function of z. */
  shiftY?: (z: number) => number;
  /** Bead scale per instance (1 = normal). */
  scale?: (i: number, z: number) => number;
  /** Radial push per instance, nm (for breathing or a wave). */
  radial?: (i: number, z: number) => number;
  color: (i: number, z: number, out: THREE.Color) => void;
}

/** Writes a microtubule's beads into an InstancedMesh (axis along local z). */
export function writeTube(mesh: THREE.InstancedMesh, o: TubeWrite) {
  const { sites, zOffset = 0, spin = 0 } = o;
  for (let i = 0; i < sites.length; i++) {
    const s = sites[i];
    const th = s.theta + spin;
    const z = s.z + zOffset;
    const k = o.scale ? o.scale(i, z) : 1;
    const rad = MT.radius + (o.radial ? o.radial(i, z) : 0);
    q.setFromAxisAngle(zAxis, th + (s.j % 3) * 0.7);
    p.set(Math.cos(th) * rad, Math.sin(th) * rad + (o.shiftY ? o.shiftY(z) : 0), z);
    const r = MT.bead * k;
    // Wider round the tube than deep, so neighbouring strands touch.
    sc.set(r * 0.9, r * 1.2 * (s.alpha ? 1.04 : 0.96), r * 1.08);
    mesh.setMatrixAt(i, m4.compose(p, q, sc));
    o.color(i, z, col);
    mesh.setColorAt(i, col);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/** Pixels per world unit at distance `d` from a perspective camera. */
export function pxPerUnitAt(cam: THREE.PerspectiveCamera, h: number, d: number) {
  return h / (2 * d * Math.tan(((cam.fov / 2) * Math.PI) / 180));
}
