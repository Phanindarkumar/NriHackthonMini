import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Michael Chen',
      content: 'Hey everyone! Just wanted to share that our team at Google is hiring for a senior data scientist position. Feel free to reach out if you\'re interested!',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      userId: '3',
      userName: 'Emily Rodriguez',
      content: 'That\'s awesome Michael! I\'m actually looking for a career change. Could you share more details?',
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: '3',
      userId: '1',
      userName: 'Sarah Johnson',
      content: 'Welcome to the alumni chat! This is a great place to network and share opportunities.',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(['Michael Chen', 'Emily Rodriguez', 'Sarah Johnson', 'David Kim']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Join the Conversation
          </h2>
          <p className="text-gray-600">
            Please sign in to access the alumni chat room.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alumni Chat Room
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with fellow alumni in real-time. Share opportunities, ask questions, and stay connected.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.userId === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {message.userId !== user.id && (
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        {message.userName}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.userId === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Online Users Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">
                Online ({onlineUsers.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {onlineUsers.map((userName) => (
                <div key={userName} className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{userName}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Chat Guidelines</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Be respectful and professional</li>
                <li>• No spam or self-promotion</li>
                <li>• Keep discussions relevant</li>
                <li>• Help and support each other</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">General Chat</h4>
            <p className="text-sm text-gray-600">Open discussions and networking</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Job Opportunities</h4>
            <p className="text-sm text-gray-600">Share and discover career opportunities</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Study Groups</h4>
            <p className="text-sm text-gray-600">Collaborate on learning and growth</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;