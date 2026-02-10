const ARCHIVE_BASE_URL = "http://www.openmusicarchive.org/browse_results.php?genre=";

function searchArchive() {
    const genre = document.getElementById('genreSelect').value;
    const resultsGrid = document.getElementById('resultsGrid');
    const intro = document.getElementById('introMessage');

    // Hide intro
    intro.style.display = 'none';
    
    // Clear previous results
    resultsGrid.innerHTML = '';

    // Create a "Collection Card" for the Archive
    const card = document.createElement('div');
    card.className = 'archive-card';
    
    card.innerHTML = `
        <div class="card-content">
            <h2>The ${genre.toUpperCase()} Collection</h2>
            <p>You are about to explore rare, out-of-copyright recordings hosted at Open Music Archive.</p>
            <p class="meta">Status: 100% Underrated / Public Domain</p>
            <a href="${ARCHIVE_BASE_URL}${genre}" target="_blank" class="visit-btn">
                Open ${genre} Catalog ↗
            </a>
        </div>
    `;

    resultsGrid.appendChild(card);
}