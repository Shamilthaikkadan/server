import express from 'express';
import { getNotification } from '../controllers/notificationController.js';

const router = express.Router();

let notifications = [];


router.get('/get-notifications', getNotification);

export default router;
