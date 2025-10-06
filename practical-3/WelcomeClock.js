import React, { useState, useEffect } from 'react';

const WelcomeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>
        The current date and time is: {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </h2>
    </div>
  );
};

export default WelcomeClock;