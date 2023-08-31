const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const REDIS_PORT = process.env.PORT || 6379;

const app = express();
const client = redis.createClient(REDIS_PORT);


const setResponse = (username, repos) => {
    return `<h2>${username} has ${repos} Github repos.</h2>`;
}

exports.getRepos = async (req, res, next) => {
    try {
        console.log('fetching... please wait...');

        // api call
        const { username } = req.params;
        const response = await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();

        // get the repos numbers in api data
        const repos = data.public_repos;

        // set data to redis with expiration 10secs
        client.setex(username, 10, repos);

        // send response
        res.send(setResponse(username, repos));

    } catch (err) {
        console.log(err);
        res.status(500);
    }
}

exports.cache = (req, res, next) => {
    const { username } = req.params;
    // check if username exists in cache
    client.get(username, (err, data) => {
        if (err) throw err;
        // if so return from the cache
        if (data !== null) {
            res.send(setResponse(username, data));
            console.log('from cache')
        } else {
            // continue to next middleware
            next();
        }
    });
}