// Database of songs divided by genre
const songData = {
    'alt-rock': [
      {
        title: "Californication",
        artist: "Red Hot Chili Peppers",
        time: "5:21",
        lyrics: "Psychic spies from China try to steal your mind's elation...",
        cover: "https://via.placeholder.com/150/a3d1a7/ffffff?text=RHCP" 
      },
      {
        title: "In the End",
        artist: "Linkin Park",
        time: "3:36",
        lyrics: "It starts with one thing, I don't know why, it doesn't even matter how hard you try...",
        cover: "https://via.placeholder.com/150/82be87/ffffff?text=LP"
      }
    ],
    'classical': [
      {
        title: "Symphony No. 5",
        artist: "Ludwig van Beethoven",
        time: "7:12",
        lyrics: "[Instrumental - No Lyrics Available]",
        cover: "https://via.placeholder.com/150/709485/ffffff?text=Beethoven"
      }
    ]
    // You can easily follow this pattern to add your EDM, Metal, J-Pop data, etc.
  };
  
  function showGenre(genreKey) {
    // Hide the initial welcome message if it's there
    const welcome = document.getElementById('welcome-message');
    if(welcome) welcome.style.display = 'none';
  
    const container = document.getElementById('songs-container');
    container.innerHTML = ""; // Clear out previous items
  
    const songs = songData[genreKey];
  
    // If genre has no data configured yet
    if (!songs || songs.length === 0) {
      container.innerHTML = `<p style="color: #709485;">No recommendations added for this genre yet!</p>`;
      return;
    }
  
    // Generate layouts for every track
    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';
  
      card.innerHTML = `
        <div class="media-container">
          <div class="vinyl-disk"></div>
          <img class="album-cover" src="${song.cover}" alt="${song.title} Album Cover">
        </div>
        <div class="song-info">
          <h3>${song.title}</h3>
          <p class="artist">By ${song.artist}</p>
          <p class="runtime">Duration: ${song.time}</p>
          <p class="lyrics">"${song.lyrics}"</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
