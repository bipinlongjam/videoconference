import React from 'react'

const Chat = () => {
  return (
    <div className="w-3/3 bg-white border-3 border-black-600 p-4 flex flex-col rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="mb-2 p-2 bg-gray-100 rounded">
          <p className="text-gray-800">User1: Hello!</p>
        </div>
        <div className="mb-2 p-2 bg-gray-100 rounded">
          <p className="text-gray-800">User2: Hi there!</p>
        </div>
        {/* Add more messages here */}
      </div>
      <div className="flex ">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 px-4 py-2 border rounded-l justify-end"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-r">
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
