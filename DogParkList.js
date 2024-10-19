$(document).ready(function () {
    fetchDogParks();

    
    $('#searchButton').on('click', function () {
        const query = $('#searchInput').val().trim();
        if (isValidInput(query)) {
            $('#inputWarning').hide(); 
            searchParks(query);
        } else {
            $('#inputWarning').show(); 
        }
    });

    
    $('#searchInput').on('input', function () {
        const query = $(this).val().trim();
        if (isValidInput(query)) {
            $('#inputWarning').hide(); 
        } else {
            $('#inputWarning').show(); 
        }
    });

    
    $('.filter-button').on('click', function () {
        $(this).toggleClass('active');
        applyFilters(); 
    });
});

let allParks = []; 
let selectedFilters = { 
    largeDog: false,
    smallDog: false,
    light: false,
    fence: false,
    dogAgilityEquipment: false
}

function isValidInput(input) {
    const regex = /^[a-zA-Z\s]*$/; 
    return regex.test(input);
}

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
                            item_description: record.item_description || '',
                            shape_area: record.shape_area || '',  
                            lighting: record.lighting || 'Unknown',  
                            fencing: record.fencing || 'Unknown',  
                            dog_agility_equipment: record.dog_agility_equipment || 'Unknown',  
                            small_dog_enclosure: record.small_dog_enclosure || 'Unknown',  
                            lat: record.lat,
                            long: record.long
                        };
                    });
                    allParks = allParks.concat(parks);
                    displayParks(allParks); 
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


function applyFilters() {
    let filteredParks = allParks;

   
    if (selectedFilters.largeDog) {
        filteredParks = filteredParks.filter(park => park.shape_area >= 2000); 
    }
    if (selectedFilters.smallDog) {
        filteredParks = filteredParks.filter(park => park.small_dog_enclosure === 'YES');
    }
    if (selectedFilters.light) {
        filteredParks = filteredParks.filter(park => park.lighting === 'YES');
    }
    if (selectedFilters.fence) {
        filteredParks = filteredParks.filter(park => park.fencing === 'FULLY FENCED');
    }
    if (selectedFilters.dogAgilityEquipment) {
        filteredParks = filteredParks.filter(park => park.dog_agility_equipment === 'YES');
    }

    displayParks(filteredParks); 
}

function displayParks(parks) {
    const parkListContainer = document.getElementById('parkList');
    parkListContainer.innerHTML = ''; 
    parks.forEach(park => {
        const parkItem = document.createElement('div');
        parkItem.className = 'park-item';
        parkItem.innerHTML = `
            <h2>${park.park_name}</h2>
            <p>${park.item_description}</p>
            <p><strong>Suburb:</strong> ${park.suburb}</p>
            <p><strong>Shape Area:</strong> ${park.shape_area} m²</p>
            <p><strong>Lighting:</strong> ${park.lighting}</p>
            <p><strong>Fencing:</strong> ${park.fencing}</p>
            <p><strong>Dog Agility Equipment:</strong> ${park.dog_agility_equipment}</p>
            <p><strong>Small Dog Enclosure:</strong> ${park.small_dog_enclosure}</p>
            <div class="park-item-buttons">
                <button class="direction-btn" data-lat="${park.lat}" data-long="${park.long}">Direction</button>
                <button class="weather-btn" data-lat="${park.lat}" data-long="${park.long}" data-suburb="${park.suburb}">Weather</button>
            </div>
        `;
        parkListContainer.appendChild(parkItem);
    });

    
    $('.direction-btn').on('click', function () {
        const lat = $(this).data('lat');
        const long = $(this).data('long');
        if (lat && long) {
            openGoogleMaps(lat, long);
        } else {
            alert('Location coordinates are missing for this park.');
        }
    });

    
    $('.weather-btn').on('click', function () {
        const lat = $(this).data('lat');  
        const lng = $(this).data('long');  
        const suburb = $(this).data('suburb');  

        
        if (lat && lng && suburb) {
            
            window.location.href = `weather.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&suburb=${encodeURIComponent(suburb)}`;
        } else {
            alert('Unable to retrieve location information for this park.');
        }
    });
}



function openGoogleMaps(lat, long) {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
    window.open(googleMapsUrl, '_blank'); 
}


$('.filter-button').on('click', function () {
    const filter = $(this).data('filter');
    selectedFilters[filter] = !selectedFilters[filter];
    applyFilters();
});

function searchParks(query) {
    if (!query) {
        displayParks(allParks); 
        return;
    }

    const filteredParks = allParks.filter(park => {
        const searchTerm = query.toLowerCase().replace(/\s+/g, '');
        const parkName = park.park_name.toLowerCase().replace(/\s+/g, '');
        const suburb = park.suburb.toLowerCase().replace(/\s+/g, '');
        return parkName.includes(searchTerm) || suburb.includes(searchTerm);
    });

    displayParks(filteredParks);
}
