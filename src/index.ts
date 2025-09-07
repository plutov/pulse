import express, { Request, Response } from "express";
import { paths } from "./types/api";

const app = express();
app.use(express.json());

app.get(
  "/repos",
  (
    _req: Request,
    res: Response<
      paths["/repos"]["get"]["responses"]["200"]["content"]["application/json"]
    >,
  ) => {
    const repos: paths["/repos"]["get"]["responses"]["200"]["content"]["application/json"] =
      [
        { id: 1, name: "repo1" },
        { id: 2, name: "repo2" },
      ];
    res.json(repos);
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
