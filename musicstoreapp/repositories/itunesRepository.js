module.exports = {
    app: null,
    init: function (app) {
        this.app = app;
    },
    searchSongs: async function(term) {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
        const data = await response.json();
        return data.results.map(song => ({
            id: song.trackId,
            titulo: song.trackName,
            artista: song.artistName,
            album: song.collectionName,
            precio: song.trackPrice,
            caratula: song.artworkUrl100
        }));
    },
    searchArtists: async function(name) {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=5`);
        const data = await response.json();
        return data.results.map(artist => ({
            id: artist.artistId,
            nombre: artist.artistName,
            genero: artist.primaryGenreName,
            enlace: artist.artistLinkUrl
        }));
    },
    searchById: async function(id) {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
        const data = await response.json();
        return data.results.map(song => ({
            id: song.trackId,
            titulo: song.trackName,
            artista: song.artistName,
            precio: song.trackPrice,
            caratula: song.artworkUrl100
        }));
    }
};