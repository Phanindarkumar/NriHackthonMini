import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, MessageCircle, TrendingUp, Award } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Connect with Alumni',
      description: 'Build meaningful connections with graduates from your institution.',
      link: '/alumni',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: 'Attend Events',
      description: 'Join networking events, workshops, and reunions.',
      link: '/events',
      color: 'bg-gradient-to-r from-blue-400 to-blue-500'
    },
    {
      icon: UserCheck,
      title: 'Find Mentors',
      description: 'Get guidance from experienced professionals in your field.',
      link: '/mentorship',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      icon: MessageCircle,
      title: 'Join Discussions',
      description: 'Participate in community conversations and share insights.',
      link: '/chat',
      color: 'bg-gradient-to-r from-blue-300 to-blue-400'
    },
    {
      icon: TrendingUp,
      title: 'Track Analytics',
      description: 'View insights about the alumni community and engagement.',
      link: '/dashboard',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'Showcase Achievements',
      description: 'Highlight your professional milestones and success stories.',
      link: '/profile',
      color: 'bg-gradient-to-r from-blue-400 to-blue-500'
    }
  ];

  const stats = [
    { label: 'Active Alumni', value: '2,847' },
    { label: 'Events This Year', value: '156' },
    { label: 'Mentorship Connections', value: '432' },
    { label: 'Success Stories', value: '89' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white relative overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Alumni graduation ceremony" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Welcome to <span className="text-white bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">AlumniConnect</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 drop-shadow">
              Connect, collaborate, and grow with a thriving community of alumni and students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/alumni"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Explore Alumni
              </Link>
              <Link
                to="/events"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-700 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive tools to help you build meaningful connections
              and advance your career through our alumni network.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 border border-blue-100"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 hover:underline"
                  >
                    Learn More →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of alumni who are already building meaningful connections
            and advancing their careers through our platform.
          </p>
          <Link
            to="/auth"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 inline-block"
          >
            Join AlumniConnect Today
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;