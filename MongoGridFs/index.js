import express from "express";
import multer from "multer";
import mongodb from 'mongodb';
import { Readable } from 'stream';
import cors from 'cors';
const { ObjectId } = mongodb;
const { MongoClient, ObjectID } = mongodb;
const photoRoute = express.Router();

var storage = multer.memoryStorage()
var upload = multer({ 
  storage: storage, 
  limits: { 
    fields: 1, 
    fileSize: 6000000, 
    files: 1, 
    parts: 3  // or a higher value based on your needs
  }
});

const videoRoute = express.Router();

var videoStorage = multer.memoryStorage();
var videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100000000, // Set the limit based on your requirements
    files: 1,
  },
});

let db;


/**
 * Create Express server && Routes configuration.
 */
const app = express();
app.use(cors())
app.get('/',(req,res)=>{
  return res.send({message: ' Express server ...'})
})
app.use('/photos', photoRoute);
app.use('/videos', videoRoute);

/**
 * Connect Mongo Driver to MongoDB.
 */
const user ="developer"
const pass="djYVaymWsGoQ48k0"
const url=`mongodb+srv://${user}:${pass}@cluster0.x5k2qbq.mongodb.net/?retryWrites=true&w=majority`;

const connectToMongoDB = async () => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(); // Use the client to get the database instance
  } catch (err) {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
  }
};

connectToMongoDB();

/**
 * GET photo by ID Route
 */
photoRoute.get('/all', async (req, res) => {
  try {
    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'photos'
    });

    // Get a cursor to all documents in the files collection
    const cursor = await db.collection('photos.files').find({});

    // Convert the cursor to an array of file information
    const files = await cursor.toArray();

    // Extract relevant information and send the response
    const result = files.map(file => ({
      id: file._id,
      filename: file.filename,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
      size: file.length,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

photoRoute.get('/:photoID', async (req, res) => {
  try {
    var photoID = new ObjectId(req.params.photoID);
    console.log("Id  ==>", photoID);
  } catch (err) {
    console.log("Error ==>",err)
    return res.status(400).json({ message: "Invalid PhotoID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
  }

  try {
    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'photos'
    });

    let downloadStream = bucket.openDownloadStream(photoID);
    // res.setHeader('Content-Type', 'image/png');
    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      res.sendStatus(404);
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * POST photo Route
 */
photoRoute.post('/', async (req, res) => {
  console.log("In Post req ==>")
  try {
    const singleUpload = upload.single('photo');
   
    singleUpload(req, res, function (err) {
      if (err) {
        console.log("Errror ==>",err)
        return res.status(400).json({ message: "Upload Request Validation Failed" });
      }

      if (!req.body.name) {
        console.log("Errror ==>name is not there")
        return res.status(400).json({ message: "No photo name in request body" });
      }
      console.log("req after err")
      let photoName = req.body.name;
      

      // Covert buffer to Readable Stream
      const readablePhotoStream = new Readable();
      readablePhotoStream.push(req.file.buffer);
      readablePhotoStream.push(null);
      
      let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'photos'
      });

      let uploadStream = bucket.openUploadStream(photoName);
      let id = uploadStream.id;
      readablePhotoStream.pipe(uploadStream);
      console.log("In Post req 2 ==>")
      uploadStream.on('error', () => {
        return res.status(500).json({ message: "Error uploading file" });
      });

      uploadStream.on('finish', () => {
        res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});



videoRoute.get('/all', async (req, res) => {
  try {
    let videoBucket = new mongodb.GridFSBucket(db, {
      bucketName: 'videos'
    });

    const cursor = await db.collection('videos.files').find({});
    const videos = await cursor.toArray();

    const result = videos.map(video => ({
      id: video._id,
      filename: video.filename,
      uploadDate: video.uploadDate,
      contentType: video.contentType,
      size: video.length,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET video by ID Route
 */
videoRoute.get('/:videoID', async (req, res) => {
  try {
    var videoID = new ObjectId(req.params.videoID);
  } catch (err) {
    return res.status(400).json({ message: "Invalid VideoID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
  }

  try {
    let videoBucket = new mongodb.GridFSBucket(db, {
      bucketName: 'videos'
    });

    let downloadStream = videoBucket.openDownloadStream(videoID);
    // Set appropriate content type based on your video format
    res.setHeader('Content-Type', 'video/mp4');

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      res.sendStatus(404);
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * POST video Route
 */
videoRoute.post('/', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "No video name in request body" });
    }

    let videoName = req.body.name;
    const readableVideoStream = new Readable();
    readableVideoStream.push(req.file.buffer);
    readableVideoStream.push(null);

    let videoBucket = new mongodb.GridFSBucket(db, {
      bucketName: 'videos'
    });

    let uploadStream = videoBucket.openUploadStream(videoName);
    let id = uploadStream.id;
    readableVideoStream.pipe(uploadStream);

    uploadStream.on('error', () => {
      return res.status(500).json({ message: "Error uploading video" });
    });

    uploadStream.on('finish', () => {
      res.status(201).json({ message: "Video uploaded successfully, stored under Mongo ObjectID: " + id });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.listen(3005, () => {
  console.log("App listening on port 3005!");
});