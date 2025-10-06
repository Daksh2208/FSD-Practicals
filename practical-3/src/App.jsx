import  { useState, useEffect } from 'react';
import "./App.css";

const DateTime = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='DateTime'>
      <h1>Welcome To Charusat!!</h1>
      <h2>It is {date.toLocaleDateString()}</h2>
      <h2>It is {date.toLocaleTimeString()}</h2>
    </div>
  );
};

export default DateTime;
