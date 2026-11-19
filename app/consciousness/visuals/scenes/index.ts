import type { SceneId } from '../../data/content';
import { anesthesia } from './anesthesia';
import { raster } from './raster';
import { spacetime } from './spacetime';
import { superradiance } from './superradiance';
import type { Scene } from './types';
import { wigner } from './wigner';

export const SCENES: Record<SceneId, Scene> = {
  superradiance,
  wigner,
  anesthesia,
  spacetime,
  raster,
};
