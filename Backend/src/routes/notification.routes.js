import { Router } from "express";
import {
  getPublicKey,
  saveSubscription,
  sendNotification
} from "../controllers/notification/notification.controller.js";

const router = Router();

router.get("/public-key", getPublicKey);

router.post("/subscribe", saveSubscription);

router.post("/send", sendNotification);

export default router;