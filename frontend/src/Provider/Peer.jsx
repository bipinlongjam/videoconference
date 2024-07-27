
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "./Socket";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext)

export const PeerProvider = (props) =>{
    const {socket} = useSocket();
    const [remoteStream, setRemoteStream] = useState(null);
    const [senders, setSenders] = useState([]);
    // const peer = useMemo(() =>
    //      new RTCPeerConnection({
    //     iceServers:[
    //         {
    //         urls:[
    //             "stun:stun.l.google.com:19302",
    //             "stun:global.stun.twilio.com:3478",
    //             ],
    //         },
    //     ]
    // }))
    const peer = useMemo(() =>
        new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ]
        }), []
    );
    const createOffer = async () =>{
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log("Created offer:", offer);
        return offer;
    }
    const createAnswer = async(offer)=>{
        await peer.setRemoteDescription(offer)
        const answer= await peer.createAnswer();
        await peer.setLocalDescription(answer)
        console.log("Created answer:", answer);
        return answer;
    }

    const setRemoteAns = async(ans) =>{
        await peer.setRemoteDescription(ans);
        console.log("Set remote answer:", ans);
    }
    const sendStream = async (stream) =>{
        const tracks = stream.getTracks();
        const newSenders = [];
        // for(const track of tracks){
        //     peer.addTrack(track, stream)
        // }
        tracks.forEach(track => {
            // Check if a sender already exists for the track
            const existingSender = senders.find(sender => sender.track === track);
            if (!existingSender) {
                const sender = peer.addTrack(track, stream); 
                newSenders.push(sender); 
            }
        });

        setSenders([...senders, ...newSenders]); 
    }
    const handleIceCandidate = useCallback((event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { candidate: event.candidate });
        }
    }, [socket]);

    useEffect(() => {
        peer.addEventListener('icecandidate', handleIceCandidate);

        return () => {
            peer.removeEventListener('icecandidate', handleIceCandidate);
        };
    }, [handleIceCandidate, peer]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
        console.log("Received remote stream:", streams[0]);
    },[])

    useEffect(() =>{
        peer.addEventListener('track', handleTrackEvent)
        return () =>{
            peer.removeEventListener('track', handleTrackEvent)
        }
    },[handleTrackEvent, peer])

    return <PeerContext.Provider 
    value={{peer,
    createOffer, 
    createAnswer,
    setRemoteAns,
    sendStream, 
    remoteStream}}>
            {props.children}
    </PeerContext.Provider>
}