function toggleMenu() {
    var navbar = document.getElementById('navbar'); 
    if (navbar.classList.contains('responsive')) {
        navbar.classList.remove('responsive'); 
    } else {
        navbar.classList.add('responsive'); 
    }
}

function searchParks() {
    var input = document.getElementById('searchInput').value;
    alert('Searching for: ' + input);
}


