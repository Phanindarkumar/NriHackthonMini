import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Building, Linkedin, Mail } from 'lucide-react';
import { mockAlumni } from '../data/mockData';
import { User } from '../types';

const Alumni: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const batches = Array.from(new Set(mockAlumni.map(alumni => alumni.batch))).sort();
  const allSkills = Array.from(new Set(mockAlumni.flatMap(alumni => alumni.skills))).sort();

  const filteredAlumni = useMemo(() => {
    return mockAlumni.filter(alumni => {
      const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alumni.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alumni.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alumni.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBatch = !selectedBatch || alumni.batch === selectedBatch;
      const matchesSkill = !selectedSkill || alumni.skills.includes(selectedSkill);

      return matchesSearch && matchesBatch && matchesSkill;
    });
  }, [searchTerm, selectedBatch, selectedSkill]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBatch('');
    setSelectedSkill('');
  };

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
            Alumni Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with fellow graduates and expand your professional network.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, role, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAlumni.length} of {mockAlumni.length} alumni
          </div>
        </motion.div>

        {/* Alumni Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni, index) => (
            <motion.div
              key={alumni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={alumni.avatar}
                    alt={alumni.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {alumni.name}
                    </h3>
                    <p className="text-blue-600 font-medium">{alumni.role}</p>
                    <p className="text-sm text-gray-500">Class of {alumni.batch}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {alumni.company && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      {alumni.company}
                    </div>
                  )}
                  
                  {alumni.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {alumni.location}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {alumni.bio}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {alumni.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {alumni.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{alumni.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`mailto:${alumni.email}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Contact</span>
                  </a>
                  
                  {alumni.linkedin && (
                    <a
                      href={alumni.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No alumni found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or clearing the filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Alumni;