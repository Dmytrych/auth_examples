import {getPayloadFromToken, verifyToken} from "./token.js";

import * as uuid from 'uuid';
import bodyParser from "body-parser";
import * as path from 'path';
const port = 3000;
import fs from 'fs';
import axios from "axios";
import {configDotenv} from "dotenv";

configDotenv();
import express from "express";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const users = [
    {
        id: "auth0|dhab",
        login: 'karambol@gmail.com',
        username: 'Dmytro Habaznia',
    }
]

const SESSION_KEY = 'Authorization';

const auth = async (username, password) => {
    const details = {
        grant_type: "http://auth0.com/oauth/grant-type/password-realm",
        client_id: process.env.CLIENT_ID,
        username: username,
        password: password,
        audience: process.env.AUDIENCE,
        client_secret: process.env.CLIENT_SECRET,
        scope: "openid",
        realm: "Username-Password-Authentication"
    }
    const params = new URLSearchParams();
    Object.entries(details).forEach(([key, value]) => params.append(key, value))

    console.log(params);

    const tokenResponse = await axios.post(`${process.env.OAUTH_URL}/oauth/token`, params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
    });
    console.log("Got the token response: " + JSON.stringify(tokenResponse.data))
    return tokenResponse.data;
}

app.use(async (req, res, next) => {
    let authorizationHeader = req.get(SESSION_KEY);

    if (!authorizationHeader){
        return next();
    }
    const accessToken = authorizationHeader;

    const payload = await verifyToken(accessToken);
    if (payload) {
        req.userId = payload.sub;
        req.user = users.find((user) => user.id === payload.sub)
        console.log(`User with id ${req.userId} authorized by Access Token`);
    } else {
        console.log('Invalid authorization header');
    }

    next();
});

app.get('/', (req, res) => {
    if (req?.userId && req?.user) {
        return res.json({
            username: req?.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    return res.sendFile(path.join("C:/Users/Lampa/Desktop/Безпека ПЗ/Лаб1/auth_examples/token_auth/" +'/index.html'));
})

app.get('/logout', (req, res) => {
    return res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const {access_token, expires_in} = await auth(login, password);

        const data = getPayloadFromToken(access_token);
        const userId = data.sub;

        console.log(`Token data ${JSON.stringify(data)}`);

        console.log(`${userId} ${login} login successful`);
        const body = {
            token: access_token,
            expiresDate: Date.now() + expires_in * 1000,
        }

        return res.json(body);
    } catch (err) {
        console.error(err);
        return res.status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


