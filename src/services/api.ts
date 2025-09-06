const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers
    }
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (userId: string, userData: any) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// Users API
export const usersAPI = {
  getUsers: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users?${queryString}`);
  },

  getUser: async (userId: string) => {
    return apiRequest(`/users/${userId}`);
  },

  getMentors: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/mentors/available?${queryString}`);
  },

  getAvailableMentors: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/mentors/available?${queryString}`);
  },

  getStats: async () => {
    return apiRequest('/users/stats/overview');
  }
};

// Events API
export const eventsAPI = {
  getEvents: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events?${queryString}`);
  },

  getEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}`);
  },

  createEvent: async (eventData: any) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  updateEvent: async (eventId: string, eventData: any) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  registerForEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}/register`, {
      method: 'POST'
    });
  },

  unregisterFromEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}/register`, {
      method: 'DELETE'
    });
  },

  addComment: async (eventId: string, content: string) => {
    return apiRequest(`/events/${eventId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }
};

// Chat API
export const chatAPI = {
  getMessages: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/chat/messages?${queryString}`);
  },

  sendMessage: async (messageData: any) => {
    return apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },

  editMessage: async (messageId: string, content: string) => {
    return apiRequest(`/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },

  deleteMessage: async (messageId: string) => {
    return apiRequest(`/chat/messages/${messageId}`, {
      method: 'DELETE'
    });
  },

  addReaction: async (messageId: string, emoji: string) => {
    return apiRequest(`/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    });
  },

  removeReaction: async (messageId: string, emoji: string) => {
    return apiRequest(`/chat/messages/${messageId}/reactions`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji })
    });
  },

  searchMessages: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/chat/search?${queryString}`);
  }
};

// Mentorship API
export const mentorshipAPI = {
  getRequests: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/mentorship/requests?${queryString}`);
  },

  getRequest: async (requestId: string) => {
    return apiRequest(`/mentorship/requests/${requestId}`);
  },

  createRequest: async (requestData: any) => {
    return apiRequest('/mentorship/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  },

  acceptRequest: async (requestId: string, responseMessage: string) => {
    return apiRequest(`/mentorship/requests/${requestId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({ responseMessage })
    });
  },

  declineRequest: async (requestId: string, responseMessage: string) => {
    return apiRequest(`/mentorship/requests/${requestId}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ responseMessage })
    });
  },

  completeRequest: async (requestId: string) => {
    return apiRequest(`/mentorship/requests/${requestId}/complete`, {
      method: 'PUT'
    });
  },

  scheduleMeeting: async (requestId: string, meetingData: any) => {
    return apiRequest(`/mentorship/requests/${requestId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(meetingData)
    });
  },

  addFeedback: async (requestId: string, feedbackData: any) => {
    return apiRequest(`/mentorship/requests/${requestId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  },

  cancelRequest: async (requestId: string) => {
    return apiRequest(`/mentorship/requests/${requestId}`, {
      method: 'DELETE'
    });
  },

  getStats: async () => {
    return apiRequest('/mentorship/stats');
  }
};

export default {
  auth: authAPI,
  users: usersAPI,
  events: eventsAPI,
  chat: chatAPI,
  mentorship: mentorshipAPI
};
