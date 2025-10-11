import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';

import config from './config';
import { BookmarkProvider } from './contexts/BookmarkContext';

import ModelPage from './components/ModelPage';
import Navigation from './components/Navigation';
import PlantDescription from './components/PlantDescription';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import BrowsePage from './components/BrowsePage';
import AdminDashboard from './pages/AdminDashboard';
import BookmarksPage from './components/BookmarksPage';
import QuizPage from './components/QuizPage';
import QuizSelection from './components/QuizSelection';
import NotesPage from './components/NotesPage';
import UserSettings from './components/UserSettings';
import Chatbot from './components/Chatbot';
import AuthCallbackPage from './pages/AuthCallbackPage';

import './styles/global.css';
import './styles/components.css';

function App() {
  const [user, setUser] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const welcomeText = "Welcome to the Virtual Herbal Garden";

  const [plantModels] = useState({
    tulasi: {
      id: 'tulasi',
      name: "Tulasi",
      image: 'https://github.com/mimictroll30/3d-models/blob/main/tulasi.jpg?raw=true',
      description: "Tulasi (Ocimum tenuiflorum), also known as holy basil...",
    },
    aloevera: {
      id: 'aloevera',
      name: "Aloe Vera",
      image: 'https://github.com/mimictroll30/3d-models/blob/main/aloevera.jpg?raw=true',
      description: "Aloe vera is a succulent plant species...",
    },
    neem: {
      id: 'neem',
      name: "Neem",
      image: 'https://github.com/mimictroll30/3d-models/blob/main/neem.jpeg?raw=true',
      description: "Neem is a tree in the mahogany family...",
    },
    ashwagandha: {
      id: 'ashwagandha',
      name: "Ashwagandha",
      image: 'https://github.com/mimictroll30/3d-models/blob/main/ashwagandha.jpg?raw=true',
      description: "Ashwagandha is a powerful adaptogenic herb...",
    },
    marjoram: {
      id: 'marjoram',
      name: "Marjoram",
      image: 'https://github.com/mimictroll30/3d-models/blob/main/marjoram.jpg?raw=true',
      description: "Marjoram is a fragrant herb...",
    },
  });

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(welcomeText.substring(0, index + 1));
      index++;
      if (index === welcomeText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [welcomeText]);

  // ✅ Fetch user profile from server (not from localStorage)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const ChatbotWrapper = () => {
    const location = useLocation();
    return location.pathname !== '/' ? <Chatbot /> : null;
  };

  return (
    <BookmarkProvider>
      <Router>
        <ChatbotWrapper />
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
              path="/home"
              element={
                <div className="home-container">
                  <Navigation user={user} />
                  <div className="home-content">
                    <h1 className="home-title" style={{ color: '#28a745' }}>
                      {displayedText}
                    </h1>
                    <div style={{ margin: '20px 0' }}>
                      <Link
                        to="/browse"
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '12px 25px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '500',
                          display: 'inline-block',
                        }}
                      >
                        Browse Plants
                      </Link>
                    </div>
                    <div className="plants-grid" style={{ marginTop: '30px' }}>
                      {Object.keys(plantModels).map((model) => (
                        <div key={model} className="plant-card" style={{
                          padding: '15px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s ease',
                        }}>
                          <Link to={`/model/${model}`} style={{ textDecoration: 'none' }}>
                            <img
                              src={plantModels[model].image}
                              alt={plantModels[model].name}
                              style={{
                                width: '180px',
                                height: '180px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                              }}
                            />
                            <p className="plant-name" style={{
                              color: '#28a745',
                              marginTop: '10px',
                              fontSize: '1.1rem',
                            }}>
                              {plantModels[model].name}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />

            <Route path="/browse" element={<BrowsePage plantModels={plantModels} />} />
            <Route path="/bookmarks" element={<BookmarksPage plantModels={plantModels} />} />
            <Route path="/quiz" element={<QuizSelection />} />
            <Route path="/quiz/:plantName" element={<QuizPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/model/:modelName" element={<ModelPage plantModels={plantModels} />} />
            <Route
              path="/admin/dashboard"
              element={
                <>
                  <Navigation user={user} />
                  <AdminDashboard />
                </>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </Router>
    </BookmarkProvider>
  );
}

export default App;
