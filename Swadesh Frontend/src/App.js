import React, { useEffect, useState } from 'react';

import axios from 'axios';

import VideoApp from './Components/VideoApp';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Fetch videos from the API using Axios
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:4000/videos/getvideos');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    // fetchVideos();
  }, []);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  return (
     <div>
     
      {/* <VideoUploadForm />
      <div>
      <h1>Video List</h1>
      <ul>
        {videos.map(video => (
          <li key={video._id}>
            {video.title}
            <ReactPlayer
              url={`http://localhost:4000/videos/stream/${video._id}`}
              controls
              width="300px"
              height="200px"
            />
          </li>
        ))}

      </ul>
    </div> */}
    {/* <FileUploadfs/> */}
    {/* <PhotoApp/> */}
    <VideoApp/>
    </div> 
  );
};

export default App;


