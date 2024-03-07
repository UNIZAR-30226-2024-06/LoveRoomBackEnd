import express, { Router, Express, Request, Response } from "express";
import { routerConnectionCheck } from './check_connection';

const app: Express = express();
const port =  3000;

app.use("/check", routerConnectionCheck);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
