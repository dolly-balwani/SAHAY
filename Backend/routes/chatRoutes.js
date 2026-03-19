import express from "express";
import { 
  chatting, 
  startSession, 
  endSession 
} from "../controllers/chatController.js";

const router = express.Router();

// Chat endpoints
router.post("/chat_with_bot", chatting);
router.post("/start_session", startSession);
router.post("/end_session", endSession);

export default router;
