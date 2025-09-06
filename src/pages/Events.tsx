import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Plus, MessageCircle, Send } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Event, Comment } from '../types';

const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });
  const [newComments, setNewComments] = useState<{ [eventId: string]: string }>({});

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      organizer: user.name,
      attendees: [user.id],
      comments: []
    };

    setEvents([event, ...events]);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '' });
    setShowAddEvent(false);
  };

  const handleAddComment = (eventId: string) => {
    if (!user || !newComments[eventId]?.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      content: newComments[eventId],
      timestamp: new Date().toISOString()
    };

    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, comments: [...event.comments, comment] }
        : event
    ));

    setNewComments({ ...newComments, [eventId]: '' });
  };

  const toggleAttendance = (eventId: string) => {
    if (!user) return;

    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isAttending = event.attendees.includes(user.id);
        const attendees = isAttending 
          ? event.attendees.filter(id => id !== user.id)
          : [...event.attendees, user.id];
        return { ...event, attendees };
      }
      return event;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Events & Discussions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join upcoming events and participate in community discussions.
          </p>
        </motion.div>

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
              <button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {showAddEvent && (
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your event"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                  </div>
                  {user && (
                    <button
                      onClick={() => toggleAttendance(event.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        event.attendees.includes(user.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {event.attendees.includes(user.id) ? 'Attending' : 'Join Event'}
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {event.organizer}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Discussion ({event.comments.length})
                    </h4>
                    <span className="text-sm text-gray-500">
                      {event.attendees.length} attending
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {event.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {user && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComments[event.id] || ''}
                        onChange={(e) => setNewComments({
                          ...newComments,
                          [event.id]: e.target.value
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(event.id);
                          }
                        }}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        onClick={() => handleAddComment(event.id)}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;