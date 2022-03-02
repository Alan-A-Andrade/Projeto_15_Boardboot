import express from "express";
import { getCategories, postCategories } from "../controllers/categoriesController.js"
import { validateNewCategory } from "../middlewares/categoriesMiddleware.js";

const categoriesRouter = express.Router();

categoriesRouter.get('/categories', getCategories)
categoriesRouter.post('/categories', validateNewCategory, postCategories)

export default categoriesRouter