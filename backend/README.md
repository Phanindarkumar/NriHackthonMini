# Alumni Connect Backend

A comprehensive backend API for the Alumni Connect application built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with secure user management
- **User Management**: Complete alumni profile management with privacy controls
- **Events System**: Create, manage, and attend alumni events
- **Real-time Chat**: Socket.IO powered messaging system with reactions and mentions
- **Mentorship Platform**: Connect mentees with mentors, request and manage mentorships
- **Search & Filtering**: Advanced search capabilities across users, events, and messages
- **Statistics & Analytics**: Comprehensive stats for users, events, and mentorships

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer (ready for implementation)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout user
- `POST /change-password` - Change password

### Users (`/api/users`)
- `GET /` - Get all users with filtering and pagination
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Deactivate user account
- `GET /stats/overview` - Get alumni statistics
- `GET /mentors/available` - Get available mentors

### Events (`/api/events`)
- `GET /` - Get all events with filtering
- `GET /:id` - Get event by ID
- `POST /` - Create new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete/cancel event
- `POST /:id/register` - Register for event
- `DELETE /:id/register` - Unregister from event
- `POST /:id/comments` - Add comment to event
- `GET /my/organized` - Get user's organized events
- `GET /my/attending` - Get user's attending events

### Chat (`/api/chat`)
- `GET /messages` - Get chat messages with pagination
- `POST /messages` - Send new message
- `PUT /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message
- `POST /messages/:id/reactions` - Add reaction to message
- `DELETE /messages/:id/reactions` - Remove reaction from message
- `GET /stats` - Get chat statistics
- `GET /search` - Search messages

### Mentorship (`/api/mentorship`)
- `GET /requests` - Get mentorship requests
- `GET /requests/:id` - Get specific mentorship request
- `POST /requests` - Create new mentorship request
- `PUT /requests/:id/accept` - Accept mentorship request
- `PUT /requests/:id/decline` - Decline mentorship request
- `PUT /requests/:id/complete` - Mark mentorship as completed
- `POST /requests/:id/meetings` - Schedule a meeting
- `POST /requests/:id/feedback` - Add feedback
- `GET /stats` - Get mentorship statistics
- `DELETE /requests/:id` - Cancel mentorship request

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-connect-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/alumni-connect
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Models

### User Model
- Personal information (name, email, batch, role)
- Professional details (company, location, skills)
- Social links (LinkedIn, GitHub, website)
- Privacy preferences
- Mentorship profile and availability

### Event Model
- Event details (title, description, date, time, location)
- Organizer and attendee management
- Comments and engagement
- Virtual event support
- Registration management

### ChatMessage Model
- Message content and metadata
- Reactions and mentions
- Reply threading
- Edit and delete functionality
- File attachment support (ready)

### MentorshipRequest Model
- Mentorship request details
- Status tracking (pending, accepted, declined, completed)
- Meeting scheduling
- Feedback and rating system
- Goal and timeline management

## Socket.IO Events

### Client to Server
- `join-chat` - Join chat room
- `send-message` - Send new message
- `mentorship-request` - Send mentorship request
- `event-update` - Update event

### Server to Client
- `new-message` - New chat message
- `message-edited` - Message edited
- `message-deleted` - Message deleted
- `message-reaction-added` - Reaction added
- `message-reaction-removed` - Reaction removed
- `new-mentorship-request` - New mentorship request
- `mentorship-request-accepted` - Request accepted
- `mentorship-request-declined` - Request declined
- `meeting-scheduled` - Meeting scheduled
- `event-updated` - Event updated

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **Privacy Controls**: User-controlled profile visibility

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## Development

### Code Structure
```
backend/
├── models/           # Database models
├── routes/           # API route handlers
├── middleware/       # Custom middleware
├── scripts/          # Utility scripts
├── uploads/          # File uploads (created automatically)
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

### Adding New Features

1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Add validation middleware if needed
4. Update server.js to include new routes
5. Add Socket.IO events if real-time features needed

### Testing

The API can be tested using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend integration

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-connect
JWT_SECRET=your-production-jwt-secret
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Performance Considerations
- Database indexing is implemented for frequently queried fields
- Pagination is used for large data sets
- Rate limiting prevents API abuse
- Compression middleware reduces response sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
