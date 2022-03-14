import fs from "fs";
import { InsertResults } from "./../api";

let data = fs.readFileSync("./data/results.json", "utf-8");
InsertResults(data);
