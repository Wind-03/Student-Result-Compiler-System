import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../lib/apiClient';
import { installMockHandlers } from './handlers';

/**
 * Wires a mock backend onto `apiClient` so every src/api/*.ts call gets a
 * realistic (delayed) response without a real server running.
 *
 * REMOVE THIS FILE'S IMPORT IN main.tsx WHEN A REAL BACKEND IS READY.
 * Nothing else in the app imports axios-mock-adapter directly, so deleting
 * the import is enough - src/api and src/hooks talk to `apiClient` either way.
 */
export function setupMocks() {
  const mock = new MockAdapter(apiClient, { delayResponse: 600 });
  installMockHandlers(mock);
}
