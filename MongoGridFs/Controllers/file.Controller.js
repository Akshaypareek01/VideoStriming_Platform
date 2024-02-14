import mongoose from 'mongoose';
import fs from 'fs';
import { GridFsStorage } from 'multer-gridfs-storage';
import  Grid from 'gridfs-stream';

const bucketName = 'myBucketName';


const connection = mongoose.connection;

let gfs;
connection.once('open', () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

const uploadFile = async (req, res) => {
    try {
      const file = req.file;
      const filePath = `${new Date().getTime()}-${file.originalname}`;
  
      const uploadStream = gfs.createWriteStream({
        filename: filePath,
        metadata: {
          filename: file.originalname,
          size: file.size,
          type: file.mimetype,
        },
      });
  
      // Pipe the file stream to the GridFS stream
      const readableStream = fs.createReadStream(file.path);
      readableStream.pipe(uploadStream);
  
      readableStream.on('end', () => {
        // Close the readable stream to release resources
        fs.unlinkSync(file.path);
      });
  
      uploadStream.on('close', () => {
        res.status(200).json({ message: 'File saved.' });
      });
  
      uploadStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
    } catch (error) {
      console.error('Error processing file upload:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const getAllFiles = async (req, res) => {
    try {
      const files = await gfs.files.find().toArray();
      // Process the files as needed
      res.json({ files });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const getImage = async (req, res) => {
  const { filename } = req.params;

  const file = await gfs.files.find({ filename }).toArray();

  if (!file || file.length === 0) {
    return res.status(404).json({ error: 'File does not exist.' });
  }

  mongoose.connection.db.gridfsBucket(bucketName).openDownloadStreamByName(filename).pipe(res);
};

const deleteFile = async (req, res) => {
  const { _id } = req.fields;

  await gfs.files.delete(new mongoose.Types.ObjectId(_id));

  res.status(200).json({ message: 'File has been deleted.' });
};

export { uploadFile, getAllFiles, getImage, deleteFile };
