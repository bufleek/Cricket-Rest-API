import express from "express";
import { router as fixtures } from "./fixtures";
import { router as series } from "./series";

export const mountRoutes = (app: express.Express) => {
  app.use("/series", series);
  app.use("/fixtures", fixtures);
};
