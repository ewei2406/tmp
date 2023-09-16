// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import studentData from './studentData';
import StudentComponent from './components/StudentComponent';
import TAComponent from './components/TAComponent';
import { OHService } from './service';
import { io, Socket } from "socket.io-client";
import JoinQueue from './components/JoinQueue';

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [userGroup, setUserGroup] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    console.log("123")
    setSocket(io("http://localhost:3000"))
    if (!socket) return;
    socket.on('connect', () => {
      console.log("Connected")
    })

    socket.on('changed', m => console.log(m))
    OHService.subscribe()
    console.log("subscripted")
  }, [])

  const handleLogin = (name: string) => {
    setName(name);
    const student = studentData.find((student) => student.name === name);
    if (student) {
      setUserGroup(student.groups);
      setLoggedIn(true);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={loggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        
        <Route path="/joinQueue/:className" element={
          loggedIn && userGroup.includes('Student') ? <JoinQueue /> : <Navigate to="/login" />
        } />

        <Route path="/" element={
          loggedIn ? (
            <div>
              <h1>Welcome, {name}!</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {userGroup.includes('TA') && <TAComponent />}
                {userGroup.includes('Student') && <StudentComponent />}
              </div>
            </div>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
};

export default App;