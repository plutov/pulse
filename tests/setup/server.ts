import * as Hapi from '@hapi/hapi';
import reposPlugin from '../../src/plugins/repos';

export async function createTestServer(): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: 0, // Use random available port for testing
    host: 'localhost',
  });

  await server.register([reposPlugin]);

  return server;
}