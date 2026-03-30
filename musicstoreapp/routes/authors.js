module.exports = function(app) {

    let authors = [
        { name: "Autor 1", group: "Grupo 1", rol: "cantante" },
        { name: "Autor 2", group: "Grupo 2", rol: "trompetista" },
        { name: "Autor 3", group: "Grupo 3", rol: "flautista" }
    ]

    app.get('/authors', function(req, res) {
       res.render('authors/authors.twig', {authors: authors});
    });

    app.get('/authors/add', function (req, res) {
        res.render("authors/add.twig");
    });

    app.post('/authors/add', function(req, res) {
        function checkParam(name, value) {
            if (value === undefined || value === null || value === "") {
                return "Parámetro: '" + name + "' no enviado en la petición.<br>";
            }
            return name + ": " + value + "<br>";
        }

        let response = "Autor agregado: " + req.body.name + "<br>"
            + "Grupo: " + req.body.group + "<br>"
            + "Rol: " + req.body.rol;

        res.send(response);
    });

    app.get('/author*', function(req, res) {
        res.redirect("/authors");
    });
}

