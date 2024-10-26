import React, { useState } from 'react';
import '../styles/Profile.css';

const Geolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError("");
        },
        (err) => {
          setError(`Error: ${err.message}`);
          setLocation(null);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div>
      <button class="button" onClick={fetchLocation}>Get Location</button>
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