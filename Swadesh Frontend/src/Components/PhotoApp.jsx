// Assuming this component is named PhotoApp.js

import React, { useState } from 'react';
import axios from 'axios';

const PhotoApp = () => {
  const [photoId, setPhotoId] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
 const [imageUrl, setImageUrl] = useState(null);
 const [imageData,setImageData] = useState([]);
 const handleGetPhotoById = async () => {
    try {
      const response = await axios.get(`http://localhost:3005/photos/all`);
      console.log("data ==>", response);
      setImageData(response.data)
    } catch (error) {
      console.error('Error fetching photo:', error.message);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('name', photoName);

      const response = await axios.post('http://localhost:3005/photos', formData);

      console.log('Photo uploaded successfully:', response.data.message);

    } catch (error) {
      console.error('Error uploading photo:', error.message);
    }
  };

  return (
    <div>
      <h1>Photo App</h1>

      {/* Fetch photo by ID */}
      <input
        type="text"
        placeholder="Enter Photo ID"
        value={photoId}
        onChange={(e) => setPhotoId(e.target.value)}
      />
      <button onClick={handleGetPhotoById}>Get Photo by ID</button>
       <br/>
      {/* Upload a new photo */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <input
        type="text"
        placeholder="Enter Photo Name"
        value={photoName}
        onChange={(e) => setPhotoName(e.target.value)}
      />
      <button onClick={handleUploadPhoto}>Upload Photo</button>
      <br/>
      <div>
        {
            imageData.map((el,index)=>{
                return <img key={index} src={`http://localhost:3005/photos/${el.id}`} alt="Photo" style={{height:"300px",width:"300px",margin:"10px"}} />
            })
        }
   
    </div>
    </div>
  );
};

export default PhotoApp;
