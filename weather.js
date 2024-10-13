$(document).ready(function () {
    let allParks = []; // 用于存储加载的公园数据

    // 从 URL 中获取 lat 和 lng 参数
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const suburb = urlParams.get('suburb');

    // 如果 lat 和 lng 存在，则调用天气数据获取函数
    if (lat && lng) {
        fetchWeatherData(lat, lng, suburb);
    } else {
        const defaultLat = -27.4698; // 布里斯班的纬度
        const defaultLng = 153.0251; // 布里斯班的经度
        const defaultSuburb = 'Brisbane'; // 默认位置名称
        fetchWeatherData(defaultLat, defaultLng, defaultSuburb); // 加载默认位置的天气
    }

    // 加载公园数据
    fetchDogParks();

    // 启用搜索功能
    enableSearchFunctionality();

    // 加载公园数据
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

    // 启用搜索功能
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

    // 根据 suburb 查找公园
    function findParkBySuburb(suburb) {
        const formattedSuburb = suburb.toLowerCase().replace(/\s+/g, '');
        return allParks.find(park => park.suburb.toLowerCase().replace(/\s+/g, '') === formattedSuburb);
    }
});

// 首字母大写，其余字母小写，每个单词首字母大写
function capitalizeWords(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str
        .toLowerCase() // 先将整个字符串转为小写
        .split(' ') // 按空格分割成单词数组
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // 对每个单词首字母大写
        .join(' '); // 重新合并成一个字符串
}

// 根据经纬度获取天气数据
function fetchWeatherData(lat, lng, suburb) {
    const apiKey = 'ac9e4661c1f54f508c672342241409'; // 
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

// 获取天气背景图
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

// 显示当前天气信息
function displayCurrentWeather(data, suburb) {
    // 从 API 返回的数据中提取位置信息和天气信息
    const { location, current } = data;
    const formattedSuburb = capitalizeWords(suburb);

    // 获取天气状况
    const condition = current.condition.text.toLowerCase();

    // 根据天气情况设置对应的背景图
    let backgroundImage = getWeatherBackground(condition);

    // 设置当前天气区域的背景
    $('.current-weather').css({
        'background-image': backgroundImage,
        'background-size': 'cover',
        'background-position': 'center',
        'color': '#000000', // 确保文字在明亮的背景下可见
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

// 显示未来几天的天气预报
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
