const apiKey = '5f2fe90d35f4269755bdac53e315ead1';

const weatherContainer = document.getElementById('weather-container');
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');    
const weatherResultsContainer = document.getElementById('weather-results');
const userLocationElement = document.getElementById('userLocation');
const clearWeatherHistoryBtn = document.getElementById('clear-history-btn');
const loadingState = document.getElementById('loading');
const locationPin = document.getElementById('location-pin');

// const forecastContainer = document.getElementById('forecast-result');
// const mapContainer = document.getElementById('map');

let weatherDataArray = JSON.parse(localStorage.getItem("weatherData")) || [];

displayWeatherHTML(weatherDataArray);

clearWeatherHistoryBtn.addEventListener('click', clearWeatherHistory);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value;
  
  loadingState.style.display = 'grid';

  try {
    const weatherData = await getWeather(city);
      
    weatherDataArray = JSON.parse(localStorage.getItem("weatherData")) || [];

    displayWeatherHTML(weatherDataArray);

    form.reset();
    
  } catch (error) {
    console.log('Error fetching weather data')

  } finally {
    loadingState.style.display = 'none';
  }

});


const getUserLocation = async () => {
  try {
      if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then(response => response.json())
        .then(data => {
          const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          data.address.county;

          const state = 
          data.address.state || 
          data.address.region || 
          data.address.country;

          locationPin.style.display =  "block";
          userLocationElement.textContent = `${city}, ${state}`;
        },
        (error) => {
        console.log("Geolocation error:", error);
        userLocationElement.textContent = "Location unavailable";
      });
    });
  }
  } catch {
    console.log("error fetching data...");
    userLocationElement.textContent = "Location unavailable";
  }

  };

getUserLocation();


const getWeather = async (city) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

    const data = await response.json();

    weatherDataArray.unshift({
      name: data.name, 
      temp: data.main.temp, 
      description: data.weather[0].description, 
      feels_like: data.main.feels_like, 
      humidity: data.main.humidity, 
      icon: data.weather[0].icon
    });

    localStorage.setItem('weatherData', JSON.stringify(weatherDataArray));
      
    return data;

  } catch {
      alert("Please enter a valid city");
  }
}


function displayWeatherHTML(data) {
let html = ""; 
  if(data.length > 0) {
     data.forEach((item, i) => {
      html += `
        <div class="weather-result">
          <div class="details">
            <p class="city">${item.name}</p>
            <p class="temperature">${item.temp} °C</p>
            <p class="description">${item.description}</p>
            <p class="feels-like">Feels like: ${item.feels_like}°</p>
            <p class="humidity">Humidity: ${item.humidity}%</p>
          </div>
          <div class="icon">
            <img src="http://openweathermap.org/img/wn/${item.icon}@2x.png" alt="${item.description}">
          </div>
        </div>
        `;
    })
  }
  
  weatherResultsContainer.innerHTML = html;
}


function clearWeatherHistory() {
  localStorage.clear();
  weatherDataArray = [];
  displayWeatherHTML(weatherDataArray);
  form.reset();
}
