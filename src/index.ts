import express, { Request, Response } from "express";
import { Repo, CreateRepoRequest } from "./apigen";

const app = express();
app.use(express.json());

app.get(
  "/repos",
  (
    _req: Request,
    res: Response<Repo[]>,
  ) => {
    const repos: Repo[] = [
      { id: 1, name: "repo1" },
      { id: 2, name: "repo2" },
    ];
    res.json(repos);
  },
);

app.post(
  "/repos",
  (
    req: Request<CreateRepoRequest>,
    res: Response<Repo>,
  ) => {
    const { name } = req.body;
    const newRepo: Repo = {
      id: Math.floor(Math.random() * 1000),
      name,
    };
    res.status(201).json(newRepo);
  },
);

const port = process.env["PORT"] || 3000;
app
  .listen(port, () => {
    console.log(`server is running at http://127.0.0.1:${port}`);
  })
  .on("error", (err) => {
    console.error("failed to start server:", err);
    process.exit(1);
  });
