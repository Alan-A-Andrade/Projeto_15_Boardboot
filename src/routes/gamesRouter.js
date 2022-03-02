import express from "express";
import { getGames, postGames } from "../controllers/gamesController.js";
import validateAddGameMiddleware from "../middlewares/gamesMiddleware.js";

const gamesRouter = express.Router();

gamesRouter.get('/games', getGames)
gamesRouter.post('/games', validateAddGameMiddleware, postGames)

export default gamesRouter