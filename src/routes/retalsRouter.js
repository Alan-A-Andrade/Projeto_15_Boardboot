import express from "express";
import { getRentals, postRentals, returnRental, deleteRental, getRentalsMetrics } from "../controllers/rentalsController.js";
import { validateRental, validateCheckOutRental } from "../middlewares/rentalsMiddleware.js";

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', validateRental, postRentals)
rentalsRouter.post('/rentals/:id/return', validateCheckOutRental, returnRental)
rentalsRouter.delete('/rentals/:id', validateCheckOutRental, deleteRental)
rentalsRouter.get('/rentals/metrics', getRentalsMetrics)


export default rentalsRouter