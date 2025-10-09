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

  const API_BASE = config.backendUrl.replace(/\/$/, "") || ; // remove trailing slash

  // Fetch all plants from backend
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/plants`);
        const data = response.data;

        // ✅ Normalize response to ensure it's an array
        if (Array.isArray(data)) {
          setPlants(data);
        } else if (data && Array.isArray(data.plants)) {
          setPlants(data.plants);
        } else {
          console.warn("Unexpected API response format:", data);
          setPlants([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching plants:", err);
        setError("Failed to load plants");
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/plants/search?name=${searchTerm}`);
      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
        setShowSearchResults(true);
        return;
      }
    } catch (err) {
      console.error("Error searching plants from API:", err);
    }

    // Fallback to local search
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    const results = Object.keys(plantModels).filter(
      (key) =>
        key.includes(lowerCaseSearch) ||
        plantModels[key].name.toLowerCase().includes(lowerCaseSearch)
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectPlant = (plant) => {
    if (typeof plant === "string" && plantModels[plant]) {
      navigate(`/model/${plant}`);
    } else if (plant._id) {
      navigate(`/model/${plant.name.toLowerCase()}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* Search Bar */}
      <div
        style={{
          padding: "30px 20px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
              backgroundColor: "white",
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
          {showSearchResults && searchResults.length > 0 && (
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
              {searchResults.map((result, index) => {
                const isApiResult = typeof result !== "string";
                const key = isApiResult ? result._id : result;
                const name = isApiResult ? result.name : plantModels[result].name;
                const image = isApiResult
                  ? result.images?.[0] || "/placeholder.jpg"
                  : plantModels[result].image;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectPlant(result)}
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
                      src={image}
                      alt={name}
                      style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }}
                    />
                    <span>{name}</span>
                  </div>
                );
              })}
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
        ) : error ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#dc3545" }}>{error}</p>
        ) : Array.isArray(plants) && plants.length > 0 ? (
          plants.map((plant) => (
            <div
              key={plant._id}
              className="plant-card"
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/model/${plant.name.toLowerCase()}`)}
            >
              <img
                src={plant.images?.[0] || "/placeholder.jpg"}
                alt={plant.name}
                style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
              <p
                style={{
                  color: "#28a745",
                  marginTop: "10px",
                  fontSize: "1.1rem",
                  textAlign: "center",
                }}
              >
                {plant.name}
              </p>
              <Link to={`/quiz/${plant.name}`} style={{ textDecoration: "none", marginTop: "10px" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#e8f5e9",
                    border: "1px solid #a5d6a7",
                    borderRadius: "5px",
                    cursor: "pointer",
                    color: "#2e7d32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <FaQuestionCircle /> Take Quiz
                </button>
              </Link>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No plants found.</p>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
