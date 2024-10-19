$(document).ready(function () {
    let allParks = []; 

    
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const suburb = urlParams.get('suburb');


    if (lat && lng) {
        fetchWeatherData(lat, lng, suburb);
    } else {
        const defaultLat = -27.4698; 
        const defaultLng = 153.0251; 
        const defaultSuburb = 'Brisbane'; 
        fetchWeatherData(defaultLat, defaultLng, defaultSuburb); 
    }

  
    fetchDogParks();

   
    enableSearchFunctionality();

    
    function fetchDogParks() {
        const baseUrl = 'https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/park-dog-off-leash-areas/records';
        const limit = 100;
        let offset = 0;

        function fetchPage(offset) {
            $.ajax({
                url: `${baseUrl}?limit=${limit}&offset=${offset}`,
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    if (response && response.results && response.results.length > 0) {
                        const parks = response.results.map(record => {
                            return {
                                park_name: record.park_name || '',
                                suburb: record.suburb || '',
                                lat: record.lat,
                                long: record.long
                            };
                        });
                        allParks = allParks.concat(parks);
                        if (response.results.length === limit) {
                            // If more results are available, fetch the next page
                            fetchPage(offset + limit);
                        }
                    } else {
                        console.log('No parks data found.');
                    }
                },
                error: function (error) {
                    console.error('Error fetching data:', error);
                }
            });
        }

        fetchPage(offset);
    }

    
    function enableSearchFunctionality() {
        $('#searchButton').on('click', function () {
            const location = $('#locationInput').val().trim();
            if (location) {
                const matchedPark = findParkBySuburb(location);
                if (matchedPark) {
                    fetchWeatherData(matchedPark.lat, matchedPark.long, matchedPark.suburb);
                } else {
                    alert('Location not found. Please enter a valid suburb.');
                }
            } else {
                alert('Please enter a valid location.');
            }
        });
    }

    
    function findParkBySuburb(suburb) {
        const formattedSuburb = suburb.toLowerCase().replace(/\s+/g, '');
        return allParks.find(park => park.suburb.toLowerCase().replace(/\s+/g, '') === formattedSuburb);
    }
});


function capitalizeWords(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str
        .toLowerCase() 
        .split(' ') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(' '); 
}


function fetchWeatherData(lat, lng, suburb) {
    const apiKey = 'ac9e4661c1f54f508c672342241409'; 
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&days=6&aqi=no&alerts=no`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            displayCurrentWeather(data, suburb);
            displayForecastWeather(data.forecast.forecastday);
        },
        error: function (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please check the coordinates and try again.');
        }
    });
}


function getWeatherBackground(condition) {
    let backgroundImage = '';
    if (condition.includes('sunny') || condition.includes('clear')) {
        backgroundImage = 'url("sunny.gif")';
    } else if (condition.includes('cloudy') || condition.includes('overcast')) {
        backgroundImage = 'url("cloudy.gif")';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        backgroundImage = 'url("rain.gif")';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
        backgroundImage = 'url("thunderstorm.gif")';
    } else if (condition.includes('snow')) {
        backgroundImage = 'url("snow.gif")';
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
        backgroundImage = 'url("fog.gif")';
    } else {
        backgroundImage = 'url("sunny.gif")';
    }
    return backgroundImage;
}


function displayCurrentWeather(data, suburb) {
    
    const { location, current } = data;
    const formattedSuburb = capitalizeWords(suburb);

    
    const condition = current.condition.text.toLowerCase();

    
    let backgroundImage = getWeatherBackground(condition);

    
    $('.current-weather').css({
        'background-image': backgroundImage,
        'background-size': 'cover',
        'background-position': 'center',
        'color': '#000000', 
        'padding': '20px',
        'border-radius': '10px',
        'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.3)'
    });
    
    const currentWeatherHtml = `
        <h2>Weather in ${formattedSuburb}, ${location.region}, ${location.country}</h2>
        <p><strong>Latitude:</strong> ${location.lat} | <strong>Longitude:</strong> ${location.lon}</p>
        <p><strong>Condition:</strong> ${current.condition.text}</p>
        <p><strong>Temperature:</strong> ${current.temp_c} °C</p>
        <p><strong>Feels Like:</strong> ${current.feelslike_c} °C</p>
        <p><strong>Humidity:</strong> ${current.humidity} %</p>
        <p><strong>Wind Speed:</strong> ${current.wind_kph} kph (${current.wind_dir})</p>
    `;
    $('.current-weather').html(currentWeatherHtml);
}


function displayForecastWeather(forecastDays) {
    let forecastHtml = '';
    forecastDays.forEach(day => {
        forecastHtml += `
            <div class="forecast-day">
                <div>
                    <h3>${day.date}</h3>
                    <p><strong>${day.day.mintemp_c} °C - ${day.day.maxtemp_c} °C</strong></p>
                </div>
                <img src="https:${day.day.condition.icon}" alt="Weather icon" class="weather-icon">
            </div>
        `;
    });
    $('.daily-forecast').html(forecastHtml);
}
