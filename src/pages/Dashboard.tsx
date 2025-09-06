import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Users, Calendar, MessageCircle, TrendingUp, Award, Building } from 'lucide-react';
import { mockAlumni, mockEvents } from '../data/mockData';

const Dashboard: React.FC = () => {
  // Process data for charts
  const batchData = mockAlumni.reduce((acc, alumni) => {
    acc[alumni.batch] = (acc[alumni.batch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const batchChartData = Object.entries(batchData).map(([batch, count]) => ({
    batch,
    count
  }));

  const skillsData = mockAlumni.reduce((acc, alumni) => {
    alumni.skills.forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillsData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const companyData = mockAlumni.reduce((acc, alumni) => {
    if (alumni.company) {
      acc[alumni.company] = (acc[alumni.company] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([company, count]) => ({ company, count }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const stats = [
    {
      title: 'Total Alumni',
      value: mockAlumni.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Events',
      value: mockEvents.length,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Discussions',
      value: mockEvents.reduce((sum, event) => sum + event.comments.length, 0),
      icon: MessageCircle,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Engagement Rate',
      value: '87%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alumni Network Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Insights and analytics about our growing alumni community.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Alumni by Batch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              Alumni by Graduation Year
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batchChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="batch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Most Common Skills
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSkills} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-purple-600" />
              Top Employers
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCompanies}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ company, percent }) => `${company} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {topCompanies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    5 new alumni joined this week
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Tech Career Panel scheduled for Feb 15
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    15 new discussions started this month
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Platform engagement increased by 23%
                  </p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;