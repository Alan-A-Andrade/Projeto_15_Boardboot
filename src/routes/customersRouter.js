import express from "express";
import { getCustomers, getCustomerById, postCustomer, updateCustomerById } from "../controllers/customersController.js";
import { validateNewClient, validateUpdateClient } from "../middlewares/customersMiddleware.js";

const customersRouter = express.Router()

customersRouter.get('/customers', getCustomers)
customersRouter.post('/customers', validateNewClient, postCustomer)
customersRouter.get('/customers/:id', getCustomerById)
customersRouter.put('/customers/:id', validateUpdateClient, updateCustomerById)



export default customersRouter