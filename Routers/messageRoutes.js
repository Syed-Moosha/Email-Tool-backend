import express from 'express';
import { composeMail, deleteMessage, getInbox, getSentMessages } from "../Controllers/messageController.js";

const router = express.Router();

router.post('/compose', composeMail);
router.get('/inbox/:email', getInbox);
router.get('/sent/:email', getSentMessages);
router.delete('/:id', deleteMessage); 

export default router;
