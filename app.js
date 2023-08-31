const express = require('express');
const { cache, getRepos } = require('./apiCall');

const PORT = process.env.PORT || 3000;

const app = express();


app.get('/repos/:username', cache, getRepos);


app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
});