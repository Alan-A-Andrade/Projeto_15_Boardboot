import express from "express";
import { getRentals, postRentals } from "../controllers/rentalsController.js";
import validateRental from "../middlewares/rentalsMiddleware.js";

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', validateRental, postRentals)

export default rentalsRouter