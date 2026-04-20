module.exports = function (app, itunesRepository, favoriteSongsRepository) {
    app.get("/api/v1.0/itunes/search", function (req, res) {
        let term = req.query.term;
        itunesRepository.searchSongs(term)
            .then(function (songs) {
                res.status(200).json(songs);
        })
            .catch(function (err) {
                res.status(500).json("Error al buscar la canción");
            })
    });
    app.get("/api/v1.0/itunes/artists/:name", function (req, res) {
       itunesRepository.searchArtists(req.params.name)
           .then(function (artists) {
               res.status(200).json(artists);
           })
           .catch(function (err) {
               res.status(500).json("Error al buscar los artistas");
           })
    });
    app.get("/api/v1.0/itunes/searchId/:id", function (req, res) {
        itunesRepository.searchById(req.params.id)
            .then(function (songs) {
                res.status(200).json(songs);
            })
        .catch(function (err) {
            res.status(500).json("Error al buscar la canción");
        })
    })
    app.post("/api/v1.0/itunes/favorites", function (req, res) {
        let songId = req.body.trackId;

        let user = res.user || req.session.user;

        if (!user) {
            return res.status(401).json({ error: "Debe estar autenticado" });
        }

        itunesRepository.searchById(songId)
            .then(results => {
                if (results.length === 0) {
                    return res.status(404).json({ error: "Canción no encontrada en iTunes" });
                }

                let song = results[0];

                let favorite = {
                    song_id: songId,
                    date: new Date(),
                    price: song.precio,
                    title: song.titulo,
                    user: user
                };

                return favoriteSongsRepository.insertFavorite(favorite);
            })
            .then(result => {
                if (result && result.error === "duplicate") {
                    res.status(409).json(result);
                } else {
                    res.status(201).json({ message: "Añadido", id: result.insertedId });
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ error: "Error al procesar el favorito" });
            });
    });

    app.delete("/api/v1.0/itunes/favorites/:song_id", function (req, res) {
        let user = res.user || req.session.user;
        if (!user) {
            return res.status(401).json({ error: "Debe estar autenticado" });
        }

        let songId = parseInt(req.params.song_id);

        let filter = {
            song_id: songId,
            user: user
        };

        favoriteSongsRepository.deleteFavorite(filter)
            .then(result => {
                if (result.deletedCount === 0) {
                    res.status(404).json({ error: "No se encontró el favorito para este usuario" });
                } else {
                    res.status(200).json({ message: "Favorito eliminado con éxito" });
                }
            })
            .catch(error => {
                res.status(500).json({ error: "Error al eliminar el favorito" });
            });
    });
    app.put("/api/v1.0/itunes/favorites/:song_id", function (req, res) {
        let user = res.user || req.session.user;
        if (!user) {
            return res.status(401).json({ error: "Debe estar autenticado" });
        }

        let songId = parseInt(req.params.song_id);

        let filter = {
            song_id: songId,
            user: user
        };

        let newFavoriteData = {
            title: req.body.title,
            price: req.body.price
        };

        const database = favoriteSongsRepository.dbClient.db(favoriteSongsRepository.database);
        const favoritesCollection = database.collection(favoriteSongsRepository.collectionName);

        favoritesCollection.updateOne(filter, { $set: newFavoriteData }, { upsert: false })
            .then(result => {
                if (result.modifiedCount === 0) {
                    res.status(404).json({ error: "No se encontró el registro o no hay cambios que realizar" });
                } else {
                    res.status(200).json({ message: "Favorito actualizado correctamente" });
                }
            })
            .catch(error => {
                res.status(500).json({ error: "Error al actualizar el favorito" });
            });
    });
}