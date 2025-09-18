import * as Hapi from '@hapi/hapi';
import { Engine as CatboxRedis } from '@hapi/catbox-redis';
import authPlugin from '../../src/plugins/auth';
import reposPlugin from '../../src/plugins/repos';

export async function createTestServer(): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: 0, // Use random available port for testing
    host: 'localhost',
    cache: [
      {
        name: "redis_cache",
        provider: {
          constructor: CatboxRedis,
          options: {
            host: process.env["REDIS_HOST"] || "localhost",
            port: Number(process.env["REDIS_PORT"]) || 6379,
            database: Number(process.env["REDIS_DB"]) || 0,
          },
        },
      },
    ],
  });

  await server.register([authPlugin, reposPlugin]);

  return server;
}