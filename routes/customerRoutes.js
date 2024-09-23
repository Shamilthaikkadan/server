import express from 'express';
import { addCustomer, deleteCustomer, getCustomer, editCustomer, customerDashboardData, magazineCustomerData, renewMagazine, graphData } from '../controllers/customerController.js';

const router = express.Router();

let customers = [];

router.post('/add-customer', addCustomer);
router.get('/customer-dashboard', customerDashboardData);
router.get('/magazine-dashboard', magazineCustomerData);
router.get('/get-customer', getCustomer);
router.get('/magazine-graph-data', graphData);
router.delete('/delete-customer/:id', deleteCustomer);
router.put('/edit-customer/:id', editCustomer);
router.put('/renew-magazine/:id', renewMagazine)


export default router;
