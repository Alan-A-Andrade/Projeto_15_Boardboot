import express from "express";
import { getRentals, postRentals, returnRental, deleteRental } from "../controllers/rentalsController.js";
import { validateRental, validateCheckOutRental } from "../middlewares/rentalsMiddleware.js";

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', validateRental, postRentals)
rentalsRouter.post('/rentals/:id/return', validateCheckOutRental, returnRental)
rentalsRouter.delete('/rentals/:id', validateCheckOutRental, deleteRental)


export default rentalsRouter