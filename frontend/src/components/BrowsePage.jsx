import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";
import config from "../config";
import Navigation from "./Navigation";
import axios from "axios";

const BrowsePage = ({ plantModels }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = (config.backendUrl || "").replace(/\/$/, "");

  // Fetch all plants from backend
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/plants`);
        const data = response.data;

        // Ensure plants is always an array
        if (Array.isArray(data)) {
          setPlants(data);
        } else if (data && Array.isArray(data.plants)) {
          setPlants(data.plants);
        } else {
          // If backend response is invalid or empty, fallback to plantModels
          console.warn("Unexpected API response. Using fallback plantModels.");
          const fallbackPlants = Object.keys(plantModels).map((key) => ({
            _id: key,
            name: plantModels[key].name,
            images: [plantModels[key].image],
          }));
          setPlants(fallbackPlants);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching plants:", err);
        setError("Failed to load plants. Showing fallback plants.");
        const fallbackPlants = Object.keys(plantModels).map((key) => ({
          _id: key,
          name: plantModels[key].name,
          images: [plantModels[key].image],
        }));
        setPlants(fallbackPlants);
        setLoading(false);
      }
    };

    fetchPlants();
  }, [API_BASE, plantModels]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/plants/search?name=${searchTerm}`);
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        setShowSearchResults(true);
        return;
      }
    } catch (err) {
      console.error("Error searching plants from API:", err);
    }

    // Fallback local search from plantModels
    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = Object.keys(plantModels)
      .filter(
        (key) =>
          key.toLowerCase().includes(lowerCaseSearch) ||
          plantModels[key].name.toLowerCase().includes(lowerCaseSearch)
      )
      .map((key) => ({
        _id: key,
        name: plantModels[key].name,
        images: [plantModels[key].image],
      }));

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectPlant = (plant) => {
    navigate(`/model/${plant.name.toLowerCase()}`);
    setShowSearchResults(false);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render plants (either API or fallback)
  const plantsToRender = showSearchResults ? searchResults : plants;

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* Search Bar */}
      <div
        style={{
          padding: "30px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#28a745", marginBottom: "20px", textAlign: "center" }}>
          Browse Plants
        </h1>
        <div ref={searchInputRef} style={{ display: "flex", maxWidth: "600px", width: "100%", position: "relative" }}>
          <input
            type="text"
            placeholder="Search for a plant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 15px",
              borderRadius: "8px",
              border: "2px solid #e9ecef",
              fontSize: "1rem",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "12px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              marginLeft: "10px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Search
          </button>

          {/* Search Results Dropdown */}
          {showSearchResults && plantsToRender.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                backgroundColor: "white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                marginTop: "5px",
                zIndex: 10,
              }}
            >
              {plantsToRender.map((plant) => (
                <div
                  key={plant._id}
                  onClick={() => handleSelectPlant(plant)}
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e9ecef",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <img
                    src={plant.images?.[0] || "/placeholder.jpg"}
                    alt={plant.name}
                    style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }}
                  />
                  <span>{plant.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plant Grid */}
      <div
        className="plants-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {loading ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading plants...</p>
        ) : plantsToRender.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>No plants found.</p>
        ) : (
          plantsToRender.map((plant) => (
            <div
              key={plant._id}
              className="plant-card"
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/model/${plant.name.toLowerCase()}`)}
            >
              <img
                src={plant.images?.[0] || "/placeholder.jpg"}
                alt={plant.name}
                style={{ width: "100%", height: "180px", borderRadius: "8px", objectFit: "cover" }}
              />
              <p style={{ color: "#28a745", marginTop: "10px", fontSize: "1.1rem", textAlign: "center" }}>
                {plant.name}
              </p>
            
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
