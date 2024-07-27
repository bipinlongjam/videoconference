
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { SocketProvider } from './Provider/Socket';
import Home from './pages/Home';
import RoomPage from './pages/Room';
import { PeerProvider } from './Provider/Peer';
import Room from './pages/Room';

function App() {
  return (
    <SocketProvider>
      <PeerProvider>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/room/:roomId" element={<RoomPage/>}/>
      </Routes>
      </PeerProvider>
    </SocketProvider>
  );
}

export default App;
