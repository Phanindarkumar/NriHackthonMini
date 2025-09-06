import { User, Event } from '../types';

export const mockAlumni: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    batch: '2019',
    role: 'Product Manager',
    skills: ['Product Strategy', 'User Research', 'Agile'],
    bio: 'Product manager with 5+ years of experience in B2B SaaS products.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Microsoft',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    joinDate: '2023-01-10'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    batch: '2018',
    role: 'Data Scientist',
    skills: ['Python', 'Machine Learning', 'SQL'],
    bio: 'Data scientist passionate about AI and machine learning applications.',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Google',
    location: 'Mountain View, CA',
    linkedin: 'https://linkedin.com/in/michaelchen',
    joinDate: '2023-02-15'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    batch: '2020',
    role: 'UX Designer',
    skills: ['Figma', 'User Research', 'Prototyping'],
    bio: 'Creative UX designer focused on creating intuitive and accessible experiences.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Adobe',
    location: 'San Jose, CA',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    joinDate: '2023-03-01'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    batch: '2017',
    role: 'DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    bio: 'DevOps engineer specializing in cloud infrastructure and automation.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    linkedin: 'https://linkedin.com/in/davidkim',
    joinDate: '2023-01-20'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa@example.com',
    batch: '2021',
    role: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'CSS'],
    bio: 'Frontend developer passionate about creating beautiful and performant web applications.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Stripe',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/lisathompson',
    joinDate: '2023-04-10'
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james@example.com',
    batch: '2016',
    role: 'Startup Founder',
    skills: ['Leadership', 'Business Strategy', 'Fundraising'],
    bio: 'Serial entrepreneur with successful exits in fintech and healthtech.',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    company: 'Wilson Ventures',
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/jameswilson',
    joinDate: '2023-02-28'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Career Panel Discussion',
    description: 'Join industry veterans as they share insights about career growth in technology.',
    date: '2024-02-15',
    time: '18:00',
    location: 'Main Auditorium',
    organizer: 'Sarah Johnson',
    attendees: ['1', '2', '3'],
    comments: [
      {
        id: '1',
        userId: '2',
        userName: 'Michael Chen',
        content: 'Looking forward to this event! Great lineup of speakers.',
        timestamp: '2024-01-10T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Alumni Networking Mixer',
    description: 'Casual networking event for alumni to connect and share experiences.',
    date: '2024-02-28',
    time: '19:00',
    location: 'Campus Center',
    organizer: 'Emily Rodriguez',
    attendees: ['1', '4', '5'],
    comments: []
  },
  {
    id: '3',
    title: 'Startup Pitch Night',
    description: 'Alumni entrepreneurs present their startups to potential investors and collaborators.',
    date: '2024-03-10',
    time: '17:30',
    location: 'Innovation Hub',
    organizer: 'James Wilson',
    attendees: ['2', '6'],
    comments: [
      {
        id: '2',
        userId: '1',
        userName: 'Sarah Johnson',
        content: 'This sounds like an amazing opportunity for aspiring entrepreneurs!',
        timestamp: '2024-01-12T14:20:00Z'
      }
    ]
  }
];