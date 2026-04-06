module.exports = {
    mongoClient: null,
    app: null,
    database: "musicStore",
    collectionName: "favorite_songs",
    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },
    getFavorites: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);
            return await favoritesCollection.find(filter, options).toArray();
        } catch (error) {
            throw (error);
        }
    },
    insertFavorite: async function (favorite) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);

            const duplicated = await favoritesCollection.findOne({
                song_id: favorite.song_id,
                user: favorite.user
            });
            if (duplicated) {
                return { error: "duplicate", message: "Esta canción ya está en tu lista." };
            }

            return await favoritesCollection.insertOne(favorite);
        } catch (error) {
            throw (error);
        }
    },
    deleteFavorite: async function (filter) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);
            return await favoritesCollection.deleteOne(filter);
        } catch (error) {
            throw (error);
        }
    }
};