const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const ChatMessage = require('../models/ChatMessage');
const MentorshipRequest = require('../models/MentorshipRequest');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    batch: '2020',
    role: 'Software Engineer',
    skills: ['React', 'Node.js', 'Python'],
    bio: 'Passionate software engineer with 3+ years of experience in full-stack development.',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/johndoe',
    preferences: {
      mentorshipAvailable: true,
      profileVisibility: 'alumni-only'
    },
    mentorshipProfile: {
      expertise: ['Web Development', 'Career Guidance', 'Technical Interviews'],
      experience: 'Senior Software Engineer with experience in startups and big tech companies.',
      availability: 'high'
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    batch: '2019',
    role: 'Product Manager',
    skills: ['Product Strategy', 'User Research', 'Agile'],
    bio: 'Product manager with 5+ years of experience in B2B SaaS products.',
    company: 'Microsoft',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    preferences: {
      mentorshipAvailable: true,
      profileVisibility: 'public'
    },
    mentorshipProfile: {
      expertise: ['Product Management', 'Strategy', 'Leadership'],
      experience: 'Led multiple product launches at Fortune 500 companies.',
      availability: 'medium'
    }
  },
  {
    name: 'Michael Chen',
    email: 'michael@example.com',
    password: 'password123',
    batch: '2018',
    role: 'Data Scientist',
    skills: ['Python', 'Machine Learning', 'SQL'],
    bio: 'Data scientist passionate about AI and machine learning applications.',
    company: 'Google',
    location: 'Mountain View, CA',
    linkedin: 'https://linkedin.com/in/michaelchen',
    preferences: {
      mentorshipAvailable: true,
      profileVisibility: 'alumni-only'
    },
    mentorshipProfile: {
      expertise: ['Data Science', 'Machine Learning', 'Analytics'],
      experience: 'PhD in Computer Science, 6+ years in data science roles.',
      availability: 'low'
    }
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    password: 'password123',
    batch: '2020',
    role: 'UX Designer',
    skills: ['Figma', 'User Research', 'Prototyping'],
    bio: 'Creative UX designer focused on creating intuitive and accessible experiences.',
    company: 'Adobe',
    location: 'San Jose, CA',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    preferences: {
      mentorshipAvailable: false,
      profileVisibility: 'alumni-only'
    }
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'password123',
    batch: '2017',
    role: 'DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    bio: 'DevOps engineer specializing in cloud infrastructure and automation.',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    linkedin: 'https://linkedin.com/in/davidkim',
    preferences: {
      mentorshipAvailable: true,
      profileVisibility: 'public'
    },
    mentorshipProfile: {
      expertise: ['DevOps', 'Cloud Architecture', 'System Design'],
      experience: 'Senior DevOps Engineer with expertise in large-scale systems.',
      availability: 'medium'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-connect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await ChatMessage.deleteMany({});
    await MentorshipRequest.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }

    console.log(`Created ${createdUsers.length} users`);

    // Create sample events
    const sampleEvents = [
      {
        title: 'Tech Career Panel Discussion',
        description: 'Join industry veterans as they share insights about career growth in technology. Learn about different career paths, skill development, and networking strategies.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        time: '18:00',
        location: 'Main Auditorium',
        organizer: createdUsers[0]._id,
        category: 'career',
        tags: ['career', 'technology', 'networking'],
        maxAttendees: 100,
        isVirtual: false
      },
      {
        title: 'Alumni Networking Mixer',
        description: 'Casual networking event for alumni to connect and share experiences. Food and drinks will be provided.',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        time: '19:00',
        location: 'Campus Center',
        organizer: createdUsers[1]._id,
        category: 'networking',
        tags: ['networking', 'social', 'mixer'],
        maxAttendees: 150,
        isVirtual: false
      },
      {
        title: 'Virtual Startup Pitch Night',
        description: 'Alumni entrepreneurs present their startups to potential investors and collaborators. Join us online for an evening of innovation.',
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        time: '17:30',
        location: 'Virtual Event',
        organizer: createdUsers[2]._id,
        category: 'educational',
        tags: ['startup', 'entrepreneurship', 'innovation'],
        maxAttendees: 200,
        isVirtual: true,
        virtualLink: 'https://zoom.us/j/example123456'
      }
    ];

    const createdEvents = [];
    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      await event.save();
      createdEvents.push(event);
    }

    console.log(`Created ${createdEvents.length} events`);

    // Add some attendees to events
    for (let i = 0; i < createdEvents.length; i++) {
      const event = createdEvents[i];
      const attendeeCount = Math.floor(Math.random() * 5) + 2; // 2-6 attendees
      
      for (let j = 0; j < attendeeCount && j < createdUsers.length; j++) {
        if (createdUsers[j]._id.toString() !== event.organizer.toString()) {
          try {
            await event.addAttendee(createdUsers[j]._id);
          } catch (error) {
            // Skip if already attending or event is full
          }
        }
      }
    }

    console.log('Added attendees to events');

    // Create sample chat messages
    const sampleMessages = [
      {
        sender: createdUsers[0]._id,
        content: 'Welcome everyone to the Alumni Connect platform! 🎉'
      },
      {
        sender: createdUsers[1]._id,
        content: 'Great to see so many familiar faces here. Looking forward to connecting with everyone!'
      },
      {
        sender: createdUsers[2]._id,
        content: 'Has anyone attended the recent tech meetups in the Bay Area?'
      },
      {
        sender: createdUsers[3]._id,
        content: 'I just launched a new design portfolio. Would love to get some feedback from fellow alumni.'
      },
      {
        sender: createdUsers[4]._id,
        content: 'For those interested in DevOps, I\'m happy to share some resources and best practices.'
      }
    ];

    const createdMessages = [];
    for (const messageData of sampleMessages) {
      const message = new ChatMessage(messageData);
      await message.save();
      createdMessages.push(message);
    }

    console.log(`Created ${createdMessages.length} chat messages`);

    // Create sample mentorship requests
    const sampleMentorshipRequests = [
      {
        mentee: createdUsers[3]._id, // Emily (UX Designer)
        mentor: createdUsers[1]._id, // Sarah (Product Manager)
        subject: 'Transitioning from Design to Product Management',
        message: 'Hi Sarah! I\'m interested in transitioning from UX design to product management. Would love to learn about your journey and get some guidance.',
        mentorshipType: 'short-term',
        preferredMeetingType: 'video-call',
        goals: ['Understand PM role', 'Build business acumen', 'Network in PM community'],
        timeline: '3-months',
        expertise: ['Product Management', 'Strategy']
      },
      {
        mentee: createdUsers[4]._id, // David (DevOps)
        mentor: createdUsers[2]._id, // Michael (Data Scientist)
        subject: 'Machine Learning for Infrastructure',
        message: 'Hi Michael! I\'m working on implementing ML-based monitoring for our infrastructure. Would appreciate your insights on ML applications in DevOps.',
        mentorshipType: 'one-time',
        preferredMeetingType: 'video-call',
        goals: ['Learn ML basics', 'Apply ML to monitoring', 'Improve system reliability'],
        timeline: '1-month',
        expertise: ['Machine Learning', 'Analytics'],
        status: 'accepted',
        responseMessage: 'Happy to help! ML in infrastructure is a fascinating area.',
        respondedAt: new Date()
      }
    ];

    const createdMentorshipRequests = [];
    for (const requestData of sampleMentorshipRequests) {
      const request = new MentorshipRequest(requestData);
      await request.save();
      createdMentorshipRequests.push(request);
    }

    console.log(`Created ${createdMentorshipRequests.length} mentorship requests`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: john@example.com, Password: password123');
    console.log('Email: sarah@example.com, Password: password123');
    console.log('Email: michael@example.com, Password: password123');
    console.log('Email: emily@example.com, Password: password123');
    console.log('Email: david@example.com, Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seed function
seedDatabase();
