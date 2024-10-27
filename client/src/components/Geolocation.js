import React, { useState } from 'react';

const Geolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setError("");
          setLoading(false);

          sendLocationToServer(currentUserId, latitude, longitude);
        },
        (err) => {
          setError(`Error: ${err.message}`);
          setLocation(null);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const sendLocationToServer = async (userId, lat, lng) => {
    try{
      const response = await fetch("/api/saveLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, logitude: lng }),
      });
      if (!response.ok) {
        throw new Error("Failed to save location to the server.");
      }
      console.log("Location saved successfully.")
    } catch (err){
      setError("Failed to save location to the server.");
    }
  };

  return (
    <div>
      <button onClick={fetchLocation}>Get Location</button>
      {loading && <p>Loading...</p>}
      {location && (
        <div>
          <h3>Location:</h3>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Geolocation;