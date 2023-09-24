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
import jwksRsa from "jwks-rsa";
import {expressjwt} from "express-jwt";
import {auth} from "express-oauth2-jwt-bearer";

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

const checkJwt = auth({
    audience: process.env.AUDIENCE,
    issuerBaseURL: `${process.env.OAUTH_URL}/`,
});

app.use(async (req, res, next) => {
    let authorizationHeader = req.get(SESSION_KEY);

    if (!authorizationHeader){
        return next();
    }
    const accessToken = authorizationHeader;

    console.log(authorizationHeader);

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
    console.log(req.userId, req.user)
    if (req?.userId && req?.user) {
        return res.json({
            username: req?.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    return res.sendFile(path.join("C:/Users/Lampa/Desktop/Безпека ПЗ/Лаб1/auth_examples/token_auth/" +'/index.html'));
})

app.get('/jwt', checkJwt, (req, res) => {
    console.log("JWT TESTED", req.auth.payload.sub);
    const foundUser = req?.auth?.payload?.sub && users.find((user) => user.id === req?.auth?.payload?.sub)

    if (foundUser) {
        return res.json({
            username: foundUser.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    return res.sendFile(path.join("C:/Users/Lampa/Desktop/Безпека ПЗ/Лаб1/auth_examples/token_auth/" +'/index.html'));
})

app.get('/logout', (req, res) => {
    return res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const { code } = req.body;

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


