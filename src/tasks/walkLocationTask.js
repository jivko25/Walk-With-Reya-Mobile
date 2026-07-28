import * as TaskManager from 'expo-task-manager';
import { WALK_LOCATION_TASK } from '../services/walkConstants';
import { loadActiveWalk } from '../services/walkStorage';
import { applyLocationToWalk, persistWalkUpdate } from '../services/walkTracking';

TaskManager.defineTask(WALK_LOCATION_TASK, async ({ data, error }) => {
  try {
    if (error) {
      console.warn('Walk location task error:', error.message);
      return;
    }

    const locations = data?.locations;
    if (!locations?.length) return;

    let walk = await loadActiveWalk();
    if (!walk?.active) return;

    let changed = false;
    for (const location of locations) {
      const result = applyLocationToWalk(walk, location.coords);
      walk = result.walk;
      changed = changed || result.changed;
    }

    if (changed && walk) {
      await persistWalkUpdate(walk);
    }
  } catch (taskError) {
    console.warn('Walk location task crashed:', taskError?.message || taskError);
  }
});
