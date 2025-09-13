import * as Hapi from "@hapi/hapi";
import { Repo, CreateRepoRequest } from "../apigen";

const reposPlugin: Hapi.Plugin<null> = {
  name: "app/repos",
  register: async function (server: Hapi.Server) {
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
  },
};

export default reposPlugin;

async function getAllReposHandler() {
  const repos: Repo[] = [
    { id: 1, name: "repo1" },
    { id: 2, name: "repo2" },
  ];
  return repos;
}

async function createRepoHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { name } = request.payload as CreateRepoRequest;
  const newRepo: Repo = {
    id: Math.floor(Math.random() * 1000),
    name,
  };
  return h.response(newRepo).code(201);
}