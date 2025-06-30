import React, { useEffect, useState } from 'react';
import './ClassroomChat.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io(process.env.REACT_APP_API_BASE_URL, {
  transports: ['websocket'],
  withCredentials: true,
  path: '/socket.io',
});

const ClassroomChat = ({ classroomId, classroomOwnerId }) => {
  //const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [fullUser, setFullUser] = useState(null);

  //const user = auth?.user;
  useEffect(() => {
  const fetchFullUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/getuser`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        setFullUser(data.data); // full user info
      } else {
        console.error('Failed to fetch user');
      }
    } catch (err) {
      console.error('Error fetching full user:', err);
    }
  };

  fetchFullUser();
}, []);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!classroomId || !fullUser) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chat/messages/${classroomId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.ok) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();
    socket.emit('join_classroom', classroomId);
  }, [classroomId, fullUser]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSend = () => {
    if (!content.trim()) return;

    socket.emit('send_message', {
      classroomId,
      senderId: fullUser._id,
      content,
    });

    setContent('');
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the chat?')) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chat/messages/${classroomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (data.ok) {
        setMessages([]);
      } else {
        alert(data.message || 'Failed to clear chat');
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
      alert('Something went wrong');
    }
  };

  if (!fullUser) {
    return <div className="chat-container">Loading chat...</div>;
  }
//   console.log(fullUser)
//   console.log("Role:", fullUser.role);
//  console.log("User ID:", fullUser._id);
//  console.log("Classroom Owner ID:", classroomOwnerId);
// console.log("Match:", user._id === classroomOwnerId);


  return (
    <div className="chat-container">
      <div className="chat-header">Classroom Chat</div>

      {fullUser.role?.toLowerCase() === 'teacher' &&
        fullUser._id?.toString() === classroomOwnerId?.toString() && (
          <>
            <button className="clear-chat-btn" onClick={handleClearChat}>
              🗑 Clear Chat
            </button>
          </>
        )}

      {/* <div style={{ color: 'blue', fontSize: '14px' }}>
        <p><strong>auth.user.role:</strong> {user.role}</p>
        <p><strong>auth.user._id:</strong> {user._id}</p>
        <p><strong>classroomOwnerId:</strong> {classroomOwnerId}</p>
      </div> */}

      <ScrollToBottom className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`messageBox ${
              msg.sender._id === fullUser._id ? 'right' : 'left'
            }`}
          >
            {msg.sender._id === fullUser._id
              ? `You: ${msg.content}`
              : `${msg.sender.name} ${
                  msg.sender.role === 'teacher' ? '(teacher)' : ''
                }: ${msg.content}`}
          </div>
        ))}
      </ScrollToBottom>

      <div className="inputBox">
        <input
          type="text"
          placeholder="Type a message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="sendBtn">
          Send
        </button>
      </div>
    </div>
  );
};

export default ClassroomChat;
