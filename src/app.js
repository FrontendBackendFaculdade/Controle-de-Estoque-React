import express from "express";
import { router } from "./routes.js";
import cors from "cors";


const app = express();

app.use(express.json());

app.use(cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "*"
}));

app.use(router);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
})