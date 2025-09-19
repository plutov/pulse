import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { Repo, CreateRepoRequest } from "../apigen";
import { RepoRepository } from "../database/repositories/repo-repository";

const repoRepository = new RepoRepository();

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const reposPlugin: Hapi.Plugin<null> = {
  name: "app/repos",
  register: function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/repos",
        handler: getAllReposHandler,
      },
    ]);

    server.route([
      {
        method: "POST",
        path: "/repos",
        handler: createRepoHandler,
      },
    ]);

    server.route([
      {
        method: "GET",
        path: "/repos/{id}",
        handler: getRepoByIdHandler,
      },
    ]);

    server.route([
      {
        method: "DELETE",
        path: "/repos/{id}",
        handler: deleteRepoHandler,
      },
    ]);
  },
};

export default reposPlugin;

async function getAllReposHandler() {
  try {
    const repoRows = await repoRepository.findAll();
    const repos: Repo[] = repoRows.map((row) => ({
      id: row.id,
      name: row.name,
    }));
    return repos;
  } catch (error) {
    console.error("Error fetching repos:", error);
    throw Boom.internal("Failed to fetch repositories");
  }
}

async function createRepoHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const { name } = request.payload as CreateRepoRequest;

    // Check if repo already exists
    const existingRepo = await repoRepository.findByName(name);
    if (existingRepo) {
      throw Boom.conflict(`Repository with name '${name}' already exists`);
    }

    const repoRow = await repoRepository.create({ name });
    const newRepo: Repo = {
      id: repoRow.id,
      name: repoRow.name,
    };

    return h.response(newRepo).code(201);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error creating repo:", error);
    throw Boom.internal("Failed to create repository");
  }
}

async function getRepoByIdHandler(request: Hapi.Request) {
  try {
    const id = request.params["id"] as string;

    if (!id) {
      throw Boom.badRequest("Repository ID is required");
    }

    if (!isValidUUID(id)) {
      throw Boom.badRequest("Invalid repository ID format");
    }

    const repoRow = await repoRepository.findById(id);
    if (!repoRow) {
      throw Boom.notFound(`Repository with ID ${id} not found`);
    }

    const repo: Repo = {
      id: repoRow.id,
      name: repoRow.name,
    };

    return repo;
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error fetching repo by ID:", error);
    throw Boom.internal("Failed to fetch repository");
  }
}

async function deleteRepoHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const id = request.params["id"] as string;

    if (!id) {
      throw Boom.badRequest("Repository ID is required");
    }

    if (!isValidUUID(id)) {
      throw Boom.badRequest("Invalid repository ID format");
    }

    const deleted = await repoRepository.delete(id);
    if (!deleted) {
      throw Boom.notFound(`Repository with ID ${id} not found`);
    }

    return h.response().code(204);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error deleting repo:", error);
    throw Boom.internal("Failed to delete repository");
  }
}
