// Get references to the HTML elements
const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherResultDiv = document.getElementById('weatherResult');

// Your OpenWeatherMap API key.
const apiKey ='e4c3add20d1fc9fcd7f42d153fd32acf';

// Listens for a click event on the Get Weather button.
getWeatherBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();

    if (!city) {
        weatherResultDiv.textContent = 'Please enter a city name.';
        return;
    }

    // In a real-world scenario, this data would come from an API.
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        weatherResultDiv.textContent = 'Fetching weather...';
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found.');
            } else if (response.status === 401) {
                // This can happen if the API key is invalid or not provided.
                throw new Error('Invalid API key. Please check your API key in script.js.');
            } else {
                throw new Error('Could not fetch weather data. Please try again.');
            }
        }

        const data = await response.json();

        const temperature = data.main.temp;
        const displayCity = data.name;

        weatherResultDiv.textContent = `The temperature in ${displayCity} is ${Math.round(temperature)}°C.`;

    } catch (error) {
        weatherResultDiv.textContent = error.message;
    }
});