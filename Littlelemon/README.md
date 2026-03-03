# FlowSpace AI

FlowSpace AI is a premium web application that uses environmental data and user behavior to create the perfect deep work conditions for maximum productivity and focus.

## Features

### 🎨 Immersive Dashboard
- Glass morphism UI with smooth page transitions
- Real-time focus score visualization with particle effects
- Ambient sound control with seamless audio crossfading
- Dark/light mode with system preference detection

### 🌡️ Smart Environment Integration
- Connect to smart devices (Philips Hue, Nest, smart plugs)
- Real-time room temperature, lighting, and noise monitoring
- Automatic environment adjustments based on focus patterns
- "Focus Mode" that optimizes all connected devices

### ⏱️ Advanced Pomodoro System
- Intelligent break scheduling based on cognitive load
- Progressive difficulty adjustment for focus sessions
- Micro-break suggestions with stretching exercises
- Session analytics with focus degradation tracking

### 🎵 AI Soundscapes
- Dynamic audio environments that adapt to task type
- Personalized background noise generation
- Focus-based volume and frequency adjustment
- Spotify integration for focus-enhancing playlists

### 📊 Deep Analytics
- Focus heatmaps throughout the day/week
- Environmental factor correlation analysis
- Productivity trends and personalized insights
- Exportable focus reports with improvement recommendations

## Tech Stack

- **Backend**: Django REST Framework with PostgreSQL & Redis
- **Frontend**: React with Framer Motion animations and Tailwind CSS
- **Real-time**: WebSockets for live environment updates
- **AI**: Custom focus optimization algorithms

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd flowspace-ai
   ```

2. Set up the backend:
   ```bash
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create a superuser
   python manage.py createsuperuser
   
   # Start the development server
   python manage.py runserver
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```

### Using Docker (Recommended)

1. Build and run the services:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### API Endpoints

- `/api/flowspace/profiles/` - User profiles
- `/api/flowspace/sessions/` - Focus sessions
- `/api/flowspace/environment/` - Environment logs
- `/api/flowspace/metrics/` - Productivity metrics
- `/api/flowspace/dashboard/` - Dashboard data

## Project Structure

```
flowspace-ai/
├── flowspace/              # Django app for FlowSpace AI
│   ├── models.py          # Data models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   ├── urls.py            # URL routing
│   ├── consumers.py       # WebSocket consumers
│   └── routing.py         # WebSocket routing
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.jsx        # Main app component
│   └── package.json       # Frontend dependencies
├── Littlelemon/           # Django project settings
├── docker-compose.yml     # Docker configuration
├── requirements.txt       # Python dependencies
└── manage.py             # Django management script
```

## Development

### Backend Development
1. Make model changes in `flowspace/models.py`
2. Create migrations: `python manage.py makemigrations flowspace`
3. Apply migrations: `python manage.py migrate`
4. Update serializers in `flowspace/serializers.py`
5. Update views in `flowspace/views.py`

### Frontend Development
1. Create new components in `frontend/src/components/`
2. Import and use components in `App.jsx`
3. Use Tailwind CSS for styling
4. Use Framer Motion for animations

## License

This project is licensed under the MIT License.