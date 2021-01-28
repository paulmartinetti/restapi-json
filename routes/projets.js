const projRoutes = (app, fs) => {
    // variables
    const dataPath = './data/reglages.json';

    const readFile = (
        callback,
        returnJson = false,
        filePath = dataPath,
        encoding = 'utf8'
    ) => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };

    const writeFile = (
        fileData,
        callback,
        filePath = dataPath,
        encoding = 'utf8'
    ) => {
        fs.writeFile(filePath, fileData, encoding, err => {
            if (err) {
                throw err;
            }

            callback();
        });
    };

    // READ
    // Notice how we can make this 'read' operation much more simple now.
    app.get('/projets', (req, res) => {
        readFile(data => {
            res.send(data);
        }, true);
    });

    // UPDATE
    app.put('/projets/:id', (req, res) => {
        readFile(data => {
            // add the new user
            const projId = req.params['id'];
            data[projId] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`projets id:${projId} updated`);
            });
        }, true);
    });

    // CREATE
    /*app.post('/projets', (req, res) => {
        readFile(data => {
            // Note: this needs to be more robust for production use. 
            // e.g. use a UUID or some kind of GUID for a unique ID value.
            const newUserId = Date.now().toString();
            // add the new user
            data[newUserId] = req.body;
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('new user added');
            });
        }, true);
    });*/



};

module.exports = projRoutes;