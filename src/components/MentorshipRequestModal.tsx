import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Clock, Target, MessageCircle } from 'lucide-react';
import { mentorshipAPI } from '../services/api';
import { User as UserType } from '../types';

interface MentorshipRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: UserType;
  onSuccess: () => void;
}

const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  isOpen,
  onClose,
  mentor,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    mentorshipType: 'short-term',
    preferredMeetingType: 'video-call',
    timeline: '3-months',
    goals: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const requestData = {
        mentor: mentor.id,
        subject: formData.subject,
        message: formData.message,
        mentorshipType: formData.mentorshipType,
        preferredMeetingType: formData.preferredMeetingType,
        timeline: formData.timeline,
        goals: formData.goals.filter(goal => goal.trim() !== ''),
        expertise: mentor.mentorshipProfile?.expertise || []
      };

      await mentorshipAPI.createRequest(requestData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send mentorship request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Request Mentorship</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mentor Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                <p className="text-blue-600 font-medium">{mentor.role}</p>
                <p className="text-sm text-gray-500">{mentor.company}</p>
              </div>
            </div>
            {mentor.mentorshipProfile?.expertise && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.mentorshipProfile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of what you'd like help with"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell the mentor about your background, current situation, and what you hope to achieve through mentorship..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Mentorship Type and Meeting Preference */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Mentorship Type
                </label>
                <select
                  value={formData.mentorshipType}
                  onChange={(e) => setFormData(prev => ({ ...prev, mentorshipType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="one-time">One-time session</option>
                  <option value="short-term">Short-term (1-3 months)</option>
                  <option value="long-term">Long-term (6+ months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  Preferred Meeting Type
                </label>
                <select
                  value={formData.preferredMeetingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredMeetingType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="video-call">Video Call</option>
                  <option value="phone-call">Phone Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="chat">Chat/Messaging</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1-week">1 week</option>
                <option value="2-weeks">2 weeks</option>
                <option value="1-month">1 month</option>
                <option value="3-months">3 months</option>
                <option value="6-months">6 months</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4 inline mr-1" />
                Goals
              </label>
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder={`Goal ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addGoal}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add another goal
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MentorshipRequestModal;
