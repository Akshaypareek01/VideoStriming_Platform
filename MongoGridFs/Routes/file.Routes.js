import express from 'express';
import multer from "multer";
import { uploadFile, getAllFiles, getImage, deleteFile } from '../Controllers/file.Controller.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/upload',upload.single('file') ,uploadFile);
router.get('/', getAllFiles);
router.get('/image/:filename', getImage);
router.post('/files/del', deleteFile);

export default router;
