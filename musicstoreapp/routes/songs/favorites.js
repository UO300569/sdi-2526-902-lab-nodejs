const {ObjectId} = require('mongodb');

module.exports = function (app, favoriteSongsRepository, songsRepository) {

    app.get("/songs/favorites", function (req, res) {
        let filter = {user: req.session.user};
        favoriteSongsRepository.getFavorites(filter, {}).then(favorites => {
            let total = 0;
            favorites.forEach(f => {
                total += parseFloat(f.price);
            });
            res.render("songs/favorites.twig", {favorites: favorites, total: total});
        }).catch(error => {
            res.send("Error al recuperar favoritos: " + error);
        });
    });

    app.post("/songs/favorites/add/:song_id", function (req, res) {
        let songId = req.params.song_id;
        let filter = {_id: new ObjectId(songId)};

        songsRepository.findSong(filter, {}).then(song => {
            if (song) {
                let favorite = {
                    song_id: new ObjectId(songId),
                    date: new Date(),
                    price: song.price,
                    title: song.title,
                    user: req.session.user
                };
                favoriteSongsRepository.insertFavorite(favorite).then(result => {
                    res.redirect("/songs/favorites");
                }).catch(error => {
                    res.send("Error al añadir a favoritos: " + error);
                });
            } else {
                res.send("La canción no existe");
            }
        }).catch(error => {
            res.send("Error al buscar la canción: " + error);
        });
    });

    app.get("/songs/favorites/delete/:song_id", function (req, res) {
        let filter = {
            song_id: new ObjectId(req.params.song_id),
            user: req.session.user
        };

        favoriteSongsRepository.deleteFavorite(filter).then(result => {
            res.redirect("/songs/favorites");
        }).catch(error => {
            res.send("Error al eliminar favorito: " + error);
        });
    });
};