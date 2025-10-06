const BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = window.OMDb_API_KEY || '309324da'; // Your OMDb API key from config.js

async function fetchMovies(searchTerm) {
    try {
        const response = await fetch(`${BASE_URL}?s=${searchTerm}&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.Response === "False") {
            throw new Error(data.Error);
        }
        return data.Search || [];
    } catch (error) {
        console.error('Failed to fetch movies:', error);
        return [];
    }
}

function displayMovies(containerId, movies) {
    const container = document.getElementById(containerId);
    if (movies.length === 0) {
        // Don't clear the container if there's an error, so loading/error message remains.
        return;
    }
    container.innerHTML = '';
    movies.forEach(movie => {
        const img = document.createElement('img');
        img.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x225?text=No+Image';
        img.alt = movie.Title || 'Movie poster';
        img.className = 'row-poster';
        img.tabIndex = 0; // Make it focusable
        img.onclick = () => showPopup(movie);
        img.onkeydown = (e) => { if (e.key === 'Enter') showPopup(movie); };
        container.appendChild(img);
    });
}


async function showPopup(movie) {
    document.getElementById('popup-title').textContent = movie.Title;
    document.getElementById('popup-overview').textContent = 'Loading details...';
    document.getElementById('popup-video').style.display = 'none'; // Hide video player

    try {
        const response = await fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const details = await response.json();
        document.getElementById('popup-overview').textContent = details.Plot || 'No overview available.';
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
        document.getElementById('popup-overview').textContent = 'Could not load movie details.';
    }
    document.getElementById('popup').style.display = 'flex';
    document.getElementById('popup').setAttribute('aria-hidden', 'false');
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('popup-video').src = '';
    document.getElementById('popup').setAttribute('aria-hidden', 'true');
}

function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    const searchResultsRow = document.getElementById('search-results-row');
    const searchResultsContainer = document.getElementById('search-results');

    if (!searchTerm) {
        searchResultsRow.style.display = 'none';
        return;
    }

    searchResultsContainer.innerHTML = '<p>Searching...</p>';
    searchResultsRow.style.display = 'block';

    const movies = await fetchMovies(searchTerm);
    if (movies.length > 0) {
        displayMovies('search-results', movies);
    } else {
        searchResultsContainer.innerHTML = `<p>No results found for "${searchTerm}".</p>`;
    }
}

async function init() {
    // Show loading in banner
    const banner = document.getElementById('banner');
    banner.innerHTML = '<div class="banner-content"><h1>Loading Content...</h1><p>Please wait while we fetch the latest movies.</p></div>';

    const movieSearches = {
        'trending': 'avengers',
        'toprated': 'godfather',
        'popular': 'star wars',
        'nowplaying': 'action',
        'upcoming': 'sci-fi'
    };

    const categoryPromises = Object.entries(movieSearches).map(async ([category, searchTerm]) => {
        const container = document.getElementById(category);
        if (container) {
            container.innerHTML = '<p>Loading...</p>';
            try {
                const movies = await fetchMovies(searchTerm);
                if (movies.length > 0) {
                    displayMovies(category, movies);
                    return movies; // Return movies for banner logic
                } else {
                    container.innerHTML = `<p>Could not load movies for this category.</p>`;
                    return [];
                }
            } catch (error) {
                container.innerHTML = `<p>Could not load movies. Check API key or network.</p>`;
                return [];
            }
        }
        return [];
    });

    const allMovies = await Promise.all(categoryPromises);
    const firstCategoryMovies = allMovies.find(movies => movies.length > 0) || [];

    if (firstCategoryMovies.length > 0) {
        const firstMovie = firstCategoryMovies[0];
        banner.style.backgroundImage = `url(${firstMovie.Poster})`;
        banner.innerHTML = `
            <div class="banner-content">
                <h1>${firstMovie.Title}</h1>
                <p>Discover the latest movies and shows.</p>
            </div>
        `;
    } else {
        banner.innerHTML = '<div class="banner-content"><h1>Error Loading Content</h1><p>Please check your API key or try again later.</p></div>';
    }

    // Setup search functionality
    document.getElementById('search-button').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}
init();
