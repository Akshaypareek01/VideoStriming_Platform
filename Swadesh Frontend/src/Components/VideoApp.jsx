import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./VideoApp.css";
const VideoApp = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    // Fetch all videos when the component mounts
    getAllVideos();
  }, []);

  const getAllVideos = async () => {
    try {
      const response = await axios.get('http://localhost:3005/videos/all');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleVideoUpload = async () => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('name', videoName);

    try {
      await axios.post('http://localhost:3005/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // After successful upload, fetch all videos again to update the list
      getAllVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(null)
    setTimeout(()=>{
        setSelectedVideo(video);
    },1000)
  
  };

  const BackgroundBanners = [

  ]

  return (
    <div className="container">
        <div style={{textAlign:"center"}}>
        <h1>Video Streaming App</h1>
        </div>
      

      {/* Video Upload Form */}
      <div style={{border:"1px solid grey",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",background:"#fff",borderRadius:"20px"}}>
       
        <input type="text" placeholder="Video Name" onChange={(e) => setVideoName(e.target.value)}   style={{
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '10px',
    width:"300px"
  }} /><br/>
        <input type="file" accept="video/*" onChange={handleFileChange}  /><br/>

        
        <button onClick={handleVideoUpload} style={{marginTop:"20px"}}>Upload Video</button ><br/>
      </div>

      {/* Display All Videos */}
      {
        videos && videos.length > 0 && <div style={{textAlign:"center"}}>
        <h2>All Videos</h2>
        </div>
      }
      

      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
      
      
          {videos.map((video) => (
            <div key={video.id} style={{borderRadius:"20px",border:"1px solid grey",height:"200px",width:"200px",display:"flex",justifyContent:"center",alignItems:"center",margin:"10px"}} onClick={() => handleVideoClick(video)}>
              <p style={{fontSize:"16px",fontWeight:"bold",color:"crimson"}}> {video.filename.toUpperCase()}</p>
            </div>
          ))}
       
      </div>

      {/* Display Selected Video */}
      {selectedVideo && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",marginTop:"30px"}}>
          <p style={{fontWeight:"bold",letterSpacing:2}}>Selected Video {selectedVideo.filename}</p>
          <video width="640" height="360" controls style={{borderRadius:"20px"}}>
            <source src={`http://localhost:3005/videos/${selectedVideo.id}`} type={selectedVideo.contentType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoApp;