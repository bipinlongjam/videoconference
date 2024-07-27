import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaVideo, FaMicrophone, FaPhoneSlash,FaComments} from 'react-icons/fa';
import { useSocket } from '../Provider/Socket';
import { usePeer } from "../Provider/Peer";

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const navigate = useNavigate();

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log('New user joined room', emailId);
        const offer = await createOffer();
        socket.emit('call-user', { emailId, offer });
        setRemoteEmailId(emailId);
    }, [createOffer, socket]);

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer } = data;
        console.log('Incoming Call from', from, offer);
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans });
        setRemoteEmailId(from);
    }, [createAnswer, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        console.log('Call got accepted', ans);
        await setRemoteAns(ans);
    }, [setRemoteAns]);

    const getUserMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMyStream(stream);
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }
            sendStream(stream); // Ensure this only sends the stream once
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }, [sendStream]);

    const handleIceCandidate = useCallback((event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { candidate: event.candidate });
        }
    }, [socket]);

    const handleNegotiationNeeded = useCallback(async () => {
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit('call-user', { emailId: remoteEmailId, offer });
        } catch (error) {
            console.error('Error during negotiation', error);
        }
    }, [peer, remoteEmailId, socket]);

    useEffect(() => {
        const handleIceCandidateEvent = ({ candidate }) => {
            if (candidate) {
                peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };
    
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('ice-candidate', handleIceCandidateEvent);
    
        peer.addEventListener('icecandidate', handleIceCandidate);
        peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    
        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
            socket.off('ice-candidate', handleIceCandidateEvent);
            peer.removeEventListener('icecandidate', handleIceCandidate);
            peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        };
    }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted, handleIceCandidate, handleNegotiationNeeded, peer]);
    
    useEffect(() => {
        if (!myStream) {
            getUserMediaStream();
        }
    }, [myStream, getUserMediaStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleVideo = () => {
        if (myStream) {
            const videoTrack = myStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setVideoEnabled(videoTrack.enabled);
        }
    };
    const toggleAudio = () => {
        if (myStream) {
            const audioTrack = myStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setAudioEnabled(audioTrack.enabled);
        }
    };
    const endCall = () => {
        const confirmed = window.confirm('Do you wish to end the call?');
        if (confirmed) {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
            navigate('/'); // Redirect to the homepage
        }
    };

    return (
        <div className="relative h-screen flex flex-col items-center justify-center content-center bg-gray-100">
            <div className="flex flex-col lg:flex-row w-full lg:max-h-[80vh]  border-6 border-gray-300 items-center justify-center">
                <div className="flex flex-col justify-center items-center lg:mt-0 ml-10">
                    <h4>You are connected to {remoteEmailId}</h4>
                    <div className="w-full h-full relative">
                        <div className="video-container flex flex-row gap-1 justify-center">
                        <div className="relative w-full lg:w-[450px] lg:h-[300px] border-2 border-gray-300 rounded-lg overflow-hidden">
                                <video
                                    playsInline
                                    muted
                                    autoPlay
                                    ref={myVideoRef}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        <div className="relative w-full lg:w-[450px] lg:h-[300px] border-2 border-gray-300 rounded-lg overflow-hidden">
                                <video
                                    playsInline
                                    autoPlay
                                    ref={remoteVideoRef}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                        <button
                            onClick={toggleChat}
                            className="absolute top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
                        >
                            <FaComments size={24} />
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                        <button
                            onClick={toggleVideo}
                            className="bg-gray-500 text-white p-3 rounded-full shadow-lg"
                        >
                            <FaVideo size={24} color={videoEnabled ? 'white' : 'red'} />
                        </button>
                        <button
                            onClick={toggleAudio}
                            className="bg-gray-500 text-white p-3 rounded-full shadow-lg"
                        >
                            <FaMicrophone size={24} color={audioEnabled ? 'white' : 'red'} />
                        </button>
                        <button
                            onClick={endCall}
                            className="bg-red-500 text-white p-3 rounded-full shadow-lg"
                        >
                            <FaPhoneSlash size={24} />
                        </button>
                    </div>
                {showChat && (
                    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
                        <div className="relative w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="flex justify-end p-4">
                                <button
                                    onClick={toggleChat}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                            {/* <Chat className="h-full w-full" /> */}
                        </div>
                    </div>
                )}
                {showChat && (
                    <div className="hidden lg:flex lg:w-1/3 border-l h-full border-gray-300 mt-4 lg:mt-0">
                        {/* <Chat className="flex-1 h-full w-full" /> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPage;
