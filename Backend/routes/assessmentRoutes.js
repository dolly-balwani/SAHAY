import express from 'express';
import { 
    getAssessmentQuestions, 
    submitAssessment 
} from '../controllers/assessmentController.js';

const router = express.Router();

// Get assessment questions
router.post('/assess', getAssessmentQuestions);

// Submit assessment responses
router.post('/submit', submitAssessment);

export default router;

