let map;
let markers = [];
let allRecords = [];
let currentInfoWindow = null;
let highlightedCircle = null;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.4698, lng: 153.0251 }, 
        zoom: 12
    });

  
    fetchDogParkData();
}

function fetchDogParkData() {
    const baseUrl = 'https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/park-dog-off-leash-areas/records';
    const limit = 100;
    let offset = 0;

    function fetchPage(offset) {
        $.ajax({
            url: `${baseUrl}?limit=${limit}&offset=${offset}`,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('API Response:', response);

                if (response && response.results && response.results.length > 0) {
                    const newRecords = response.results.map(record => {
                        return {
                            lat: record.lat,
                            lng: record.long,
                            park_name: record.item_description,
                            suburb: record.suburb ? record.suburb.toLowerCase() : '',
                            fencing: record.fencing || 'Unknown',
                            lighting: record.lighting || 'Unknown',
                            small_dog_enclosure: record.small_dog_enclosure || 'Unknown'
                        };
                    }).filter(record => record.lat && record.lng);

                    allRecords = allRecords.concat(newRecords);

                    if (newRecords.length < limit) {
                        showMarkers(allRecords);
                    } else {
                        offset += limit;
                        fetchPage(offset);
                    }
                } else {
                    showMarkers(allRecords);
                }
            },
            error: function(error) {
                console.error('Error fetching data:', error);
                alert('Error fetching data. Please try again later.');
            }
        });
    }

    fetchPage(offset);
}


function showMarkers(records) {
    clearMarkers(); 

    if (records.length === 0) {
        alert('No dog parks found in the specified suburb.');
        return;
    }

    records.forEach(record => {
        if (record) {
            const lat = record.lat;
            const lng = record.lng;
            const parkName = record.park_name;
            const suburb = record.suburb;
            const fencing = record.fencing;
            const lighting = record.lighting;
            const smallDogEnclosure = record.small_dog_enclosure;

            if (lat && lng) {
                const latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

                const marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: parkName,
                     icon: {
                        url: 'location.svg', 
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });


                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <strong>Park Name:</strong> ${parkName.trim()}<br>
                            <strong>Suburb:</strong> ${suburb.trim()}<br>
                            <strong>Fencing:</strong> ${fencing.trim()}<br>
                            <strong>Lighting:</strong> ${lighting.trim()}<br>
                            <strong>Small Dog Enclosure:</strong> ${smallDogEnclosure.trim()}
                        </div>
                    `
                });


                marker.addListener('click', () => {
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                    }
                    currentInfoWindow = infoWindow;
                    infoWindow.open(map, marker);
                });

                markers.push(marker);
            }
        }
    });
}


function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}


function highlightArea(suburb) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': suburb }, function (results, status) {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;

            map.setCenter(location);
            map.setZoom(14); 

            
            drawCircle(location);
        } else {
            alert('Could not find the specified area: ' + suburb);
        }
    });
}


function drawCircle(location) {
    if (highlightedCircle) {
        highlightedCircle.setMap(null);
    }

    highlightedCircle = new google.maps.Circle({
        strokeColor: '#00c4ff',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00c4ff',
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: 2000 
    });
}


function geoLocate() {
    var inputElement = document.getElementById('searchBox');
    var input = inputElement.value.trim().toLowerCase();
    if (input) {
        filterMarkers(input);
        highlightArea(input);
    } else {
        alert('Please enter a suburb name to search.');
    }
}


function filterMarkers(suburb) {
    const lowerCaseSuburb = suburb.toLowerCase();
    const filteredRecords = allRecords.filter(record => record.suburb && record.suburb.includes(lowerCaseSuburb));
    showMarkers(filteredRecords);
}


function toggleMenu() {
    var navbar = document.getElementById('navbar');
    if (navbar.style.display === 'flex') {
        navbar.style.display = 'none';
    } else {
        navbar.style.display = 'flex';
    }
}
