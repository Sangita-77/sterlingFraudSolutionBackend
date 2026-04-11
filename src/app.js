import express from "express";

import cors from "cors";

import helmet from "helmet";

import routes from "./routes.js";

import { languageDetectionMiddleware } from "./middlewares/language.middleware.js";

// import errorMiddleware from "./middlewares/error.middleware.js";

// app.get('/', (req, res) => {
//   res.send('API WORKING');
// });

const app = express();



app.use(helmet());



app.use(cors());

app.use(express.json());

// Apply language detection middleware globally
app.use(languageDetectionMiddleware);



app.use("/api", routes);



// app.use(errorMiddleware);



export default app;