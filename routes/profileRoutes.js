import express from 'express';
import {getProfile, updateProfile} from '../controllers/profileController.js';

const router = express.Router();

let profile = [];
router.get('/get-profile', getProfile);
router.put('/update-profile', updateProfile);

export default router;
