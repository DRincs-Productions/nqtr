import type { LocationInterface } from "@/interface";
import { logger } from "@/utils/log-utility";
import { CachedMap } from "@drincs/pixi-vn";

/**
 * A Map that contains all locations registered and available to be used.
 * The key is the id of the location and the value is the location itself.
 */
export const registeredLocations = new CachedMap<string, LocationInterface>({ cacheSize: 20 });

namespace RegisteredLocations {
    /**
     * Save a location in the registered locations. If the location already exists, it will be overwritten.
     * @param locations The location to save.
     * @returns
     */
    export function add(...locations: (LocationInterface | LocationInterface[])[]) {
        for (const location of locations) {
            if (Array.isArray(location)) {
                add(...location);
                return;
            }
            registeredLocations.set(location.id, location);
        }
    }

    /**
     * Get a location by its id.
     * @param id The id of the location.
     * @returns The location or undefined if not found.
     */
    export function get(id: string): LocationInterface | undefined {
        try {
            const location = registeredLocations.get(id);
            if (!location) {
                console.warn(`[NQTR] Location ${id} not found, you should register it first`);
                return;
            }
            return location;
        } catch (e) {
            logger.error(`Error while getting Location ${id}`, e);
            return;
        }
    }

    /**
     * Get a list of all locations registered.
     * @returns An array of locations.
     */
    export function values(): LocationInterface[] {
        return Array.from(registeredLocations.values());
    }

    /**
     * Check if a location is registered.
     * @param id The id of the location.
     * @returns True if the location is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredLocations.has(id);
    }

    /**
     * Remove all registered locations.
     * Primarily used by the Vite plugin to reset state between hot-module reloads.
     */
    export function clear(): void {
        registeredLocations.clear();
    }
}
export default RegisteredLocations;
