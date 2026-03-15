import express from 'express';
import { calculateShipping, getShippingRates } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/calculate', calculateShipping);
router.get('/rates', getShippingRates);

export default router;
