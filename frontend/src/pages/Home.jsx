import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../Provider/Socket';

const Home = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState();
  const [roomId, setRoomId] = useState();
  

  const handleStartCall = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

    const handleRoomJoined = useCallback(({roomId}) =>{
    navigate(`/room/${roomId}`)
  },[navigate])
  useEffect(()=>{
    socket.on('joined-room',handleRoomJoined)
    return () =>{
      socket.off('joined-room',handleRoomJoined)
    }
  },[handleRoomJoined, socket])

  const handleJoinRoom =()=>{
      socket.emit('join-room', {emailId:email, roomId})
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Video Conference</h1>
      
      <button
        onClick={handleStartCall}
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-700 mb-4 w-full max-w-xs"
      >
        Join Room
      </button>

      {/* Username Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-w-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-2/3">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-headline"
                    >
                      Enter Your Username
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-2/3">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-headline"
                    >
                      Enter RoomID
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter RoomId"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center justify-center">
                <button
                  onClick={handleJoinRoom}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Enter Meeting
                </button>
                <button
                  onClick={handleModalClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
