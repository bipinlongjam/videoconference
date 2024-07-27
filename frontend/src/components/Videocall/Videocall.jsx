import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
  faSyncAlt,
  faUserPlus,
  faPhone,
  faPalette
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function VideoCall({ username }) {
  const [stream, setStream] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-200'); // Initial background color
  const [showColorOptions, setShowColorOptions] = useState(false); // State for showing color options dropdown
  const videoRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(initialStream);
        videoRef.current.srcObject = initialStream;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoDevices);
        if (initialStream.getVideoTracks().length > 0) {
          setSelectedDevice(initialStream.getVideoTracks()[0].getSettings().deviceId);
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getMediaStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleDeviceChange = async (deviceId) => {
    if (stream) {
      try {
        const audioTrack = stream.getAudioTracks()[0];
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: { deviceId: audioTrack.getSettings().deviceId }
        });

        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setSelectedDevice(deviceId);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }
  };

  const handleFlipCamera = () => {
    const currentIndex = videoDevices.findIndex(device => device.deviceId === selectedDevice);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDeviceId = videoDevices[nextIndex]?.deviceId || '';

    handleDeviceChange(nextDeviceId);
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleMicrophone = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicrophoneOn(audioTrack.enabled);
    }
  };

  const handleEndCall = () => {
    const confirmed = window.confirm('Do you wish to end the call?');
    if (confirmed) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsVideoOn(false);
        setIsMicrophoneOn(false);
        navigate('/');
      }
    }
  };

  const handleAddParticipant = () => {
    const participantName = prompt('Enter participant name:');
    if (participantName) {
      setParticipants([...participants, participantName]);
    }
  };

  const changeBackground = (color) => {
    setBackgroundColor(color);
    setShowColorOptions(false); // Close color options dropdown after selecting a background
  };

  return (
    <div className={`flex-1 flex items-center justify-center border border-white relative`}>
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          className={`w-full h-full object-cover ${!isVideoOn ? 'flashlight-off' : ''} ${backgroundColor}`}
        ></video>
      )}
      {showColorOptions && (
        <div className="absolute bottom-16 flex flex-row ml-80 transform -translate-x-1/2 w-40 text-white rounded-md shadow-lg z-10">
          <button onClick={() => changeBackground('bg-gray-200')} className="block w-full px-3 py-2 text-white hover:text-gray-300">
            Gray
          </button>
          <button onClick={() => changeBackground('bg-blue-200')} className="block w-full px-3 py-2 text-white hover:text-gray-300">
            Blue
          </button>
          <button onClick={() => changeBackground('bg-green-200')} className="block w-full px-3 py-2 text-white hover:text-gray-300">
            Green
          </button>
        </div>
      )}
      <div className="absolute bottom-4 flex gap-4">
        <button onClick={toggleCamera} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
          <FontAwesomeIcon icon={isVideoOn ? faVideo : faVideoSlash} className={!isVideoOn ? 'text-red-500' : ''} />
        </button>
        <button onClick={toggleMicrophone} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
          <FontAwesomeIcon icon={isMicrophoneOn ? faMicrophone : faMicrophoneSlash} className={!isMicrophoneOn ? 'text-red-500' : ''} />
        </button>
        <button onClick={handleFlipCamera} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
        <button onClick={handleAddParticipant} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
          <FontAwesomeIcon icon={faUserPlus} />
        </button>
        <div className="relative">
          <button onClick={() => setShowColorOptions(!showColorOptions)} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
            <FontAwesomeIcon icon={faPalette} className="text-gray-800" />
          </button>
        </div>
        <button onClick={handleEndCall} className="px-3 py-2 bg-white text-gray-800 rounded-md shadow-md">
          <FontAwesomeIcon icon={faPhone} className="text-red-500" />
        </button>
      </div>
      <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md">
        <h3 className="text-gray-800 font-bold">Participants:</h3>
        <ul>
          {participants.map((participant, index) => (
            <li key={index} className="text-gray-800">{participant}</li>
          ))}
        </ul>
      </div>
      {username && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md">
          <h3 className="text-gray-800 font-bold">You:</h3>
          <p className="text-gray-800">{username}</p>
        </div>
      )}
    </div>
  );
}

export default VideoCall;
