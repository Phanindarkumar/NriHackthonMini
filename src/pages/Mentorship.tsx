import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Search, MessageCircle, Star, Award } from 'lucide-react';
import { usersAPI, mentorshipAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import MentorshipRequestModal from '../components/MentorshipRequestModal';
import { User as UserType, MentorshipRequest } from '../types';

const Mentorship: React.FC = () => {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [activeTab, setActiveTab] = useState<'find-mentor' | 'be-mentor' | 'my-requests'>('find-mentor');
  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState<UserType[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<UserType | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [becomeMentorForm, setBecomeMentorForm] = useState({
    experience: '',
    capacity: '',
    expertise: [] as string[],
    philosophy: '',
    availability: 'medium' as 'high' | 'medium' | 'low'
  });

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (user) {
      loadMentors();
      loadMentorshipRequests();
    }
  }, [user]);

  useEffect(() => {
    // Listen for real-time mentorship updates
    on('new-mentorship-request', handleNewMentorshipRequest);
    on('mentorship-request-accepted', handleRequestAccepted);
    on('mentorship-request-declined', handleRequestDeclined);

    return () => {
      off('new-mentorship-request', handleNewMentorshipRequest);
      off('mentorship-request-accepted', handleRequestAccepted);
      off('mentorship-request-declined', handleRequestDeclined);
    };
  }, [on, off]);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getMentors();
      setMentors(response.data.mentors);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMentorshipRequests = async () => {
    if (!user) return;
    
    setRequestsLoading(true);
    try {
      const response = await mentorshipAPI.getMyRequests();
      setMentorshipRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to load mentorship requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleNewMentorshipRequest = (data: any) => {
    setMentorshipRequests(prev => [data.request, ...prev]);
  };

  const handleRequestAccepted = (data: any) => {
    setMentorshipRequests(prev => 
      prev.map(req => req.id === data.request.id ? data.request : req)
    );
  };

  const handleRequestDeclined = (data: any) => {
    setMentorshipRequests(prev => 
      prev.map(req => req.id === data.request.id ? data.request : req)
    );
  };

  const handleRequestMentorship = (mentor: UserType) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    loadMentorshipRequests();
  };

  const handleBecomeMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!becomeMentorForm.experience || !becomeMentorForm.philosophy || becomeMentorForm.expertise.length === 0) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const updatedProfile = {
        preferences: {
          emailNotifications: user.preferences?.notifications?.email ?? true,
          profileVisibility: user.preferences?.privacy ?? 'alumni-only',
          mentorshipAvailable: true
        },
        mentorshipProfile: {
          expertise: becomeMentorForm.expertise,
          experience: becomeMentorForm.philosophy,
          availability: becomeMentorForm.availability
        }
      };

      await authAPI.updateProfile(user.id, updatedProfile);
      alert('Successfully registered as a mentor!');
      setActiveTab('find-mentor');
      
      // Reset form
      setBecomeMentorForm({
        experience: '',
        capacity: '',
        expertise: [],
        philosophy: '',
        availability: 'medium'
      });
    } catch (error: any) {
      console.error('Failed to become mentor:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error details:', {
        message: errorMessage,
        status: error?.status,
        response: error?.response
      });
      alert(`Failed to register as mentor: ${errorMessage}. Please try again.`);
    }
  };

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    setBecomeMentorForm(prev => ({
      ...prev,
      expertise: checked 
        ? [...prev.expertise, expertise]
        : prev.expertise.filter(e => e !== expertise)
    }));
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Join the Mentorship Program
          </h2>
          <p className="text-gray-600">
            Please sign in to access mentorship features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mentorship Program
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with experienced professionals for career guidance or share your expertise with the next generation.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="flex">
            <button
              onClick={() => setActiveTab('find-mentor')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'find-mentor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              }`}
            >
              Find a Mentor
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'my-requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('be-mentor')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'be-mentor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              }`}
            >
              Become a Mentor
            </button>
          </div>
        </motion.div>

        {activeTab === 'find-mentor' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search mentors by name, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </motion.div>

            {/* Mentors Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading mentors...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mentor.name}
                        </h3>
                        <p className="text-blue-600 font-medium">{mentor.role}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Award className="h-3 w-3 mr-1" />
                          Class of {mentor.batch}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {mentor.bio}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {mentor.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{mentor.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">(12 reviews)</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRequestMentorship(mentor)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">Request Mentorship</span>
                      </button>
                      <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                My Mentorship Requests
              </h2>
              <p className="text-gray-600">
                Track your mentorship requests and manage ongoing mentorships.
              </p>
            </div>

            {requestsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading requests...</p>
              </div>
            ) : mentorshipRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't sent any mentorship requests. Start by finding a mentor!
                </p>
                <button
                  onClick={() => setActiveTab('find-mentor')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find Mentors
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {mentorshipRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.mentor.avatar}
                          alt={request.mentor.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.mentor.name}</h3>
                          <p className="text-sm text-gray-600">{request.mentor.role}</p>
                          <p className="text-sm text-gray-500">{request.mentor.company}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 mb-2"><strong>Message:</strong> {request.message}</p>
                      <p className="text-gray-700 mb-2"><strong>Goals:</strong> {request.goals.join(', ')}</p>
                      <p className="text-gray-700 mb-2"><strong>Meeting Type:</strong> {request.preferredMeetingType}</p>
                      <p className="text-gray-700"><strong>Duration:</strong> {request.expectedDuration}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => {/* Navigate to chat */}}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Start Chat
                        </button>
                      )}
                      {request.status === 'pending' && (
                        <span className="text-yellow-600">Waiting for response...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'be-mentor' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Become a Mentor
                </h2>
                <p className="text-gray-600">
                  Share your experience and help guide the next generation of professionals.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Why Mentor?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Give back to your alma mater</li>
                    <li>• Develop leadership skills</li>
                    <li>• Expand your professional network</li>
                    <li>• Stay connected with emerging trends</li>
                    <li>• Make a meaningful impact</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    Mentor Responsibilities
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Monthly 30-minute sessions</li>
                    <li>• Career guidance and advice</li>
                    <li>• Resume and interview feedback</li>
                    <li>• Industry insights sharing</li>
                    <li>• Goal setting and progress tracking</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleBecomeMentor} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <select 
                      value={becomeMentorForm.experience}
                      onChange={(e) => setBecomeMentorForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select experience level</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentoring Capacity
                    </label>
                    <select 
                      value={becomeMentorForm.capacity}
                      onChange={(e) => setBecomeMentorForm(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">How many mentees?</option>
                      <option value="1-2">1-2 mentees</option>
                      <option value="3-5">3-5 mentees</option>
                      <option value="5+">5+ mentees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas of Expertise
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'Software Engineering', 'Product Management', 'Data Science', 'Design',
                      'Marketing', 'Sales', 'Finance', 'Consulting',
                      'Entrepreneurship', 'Leadership', 'Career Transition', 'Interview Prep'
                    ].map((area) => (
                      <label key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={becomeMentorForm.expertise.includes(area)}
                          onChange={(e) => handleExpertiseChange(area, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentoring Philosophy
                  </label>
                  <textarea
                    rows={4}
                    value={becomeMentorForm.philosophy}
                    onChange={(e) => setBecomeMentorForm(prev => ({ ...prev, philosophy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your approach to mentoring and what you hope to achieve..."
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply to Become a Mentor
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Mentorship Request Modal */}
        {selectedMentor && (
          <MentorshipRequestModal
            isOpen={showRequestModal}
            onClose={() => {
              setShowRequestModal(false);
              setSelectedMentor(null);
            }}
            mentor={selectedMentor}
            onSuccess={handleRequestSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Mentorship;