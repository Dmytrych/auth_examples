import * as fs from "fs";
import axios from "axios";
import jwt from "jsonwebtoken";

const verifyOptions = {
    issuer: process.env.OAUTH_URL,
    audience: process.env.AUDIENCE,
    algorithms: ['RS256'],
};

export async function verifyToken(accessToken) {
    try {
        const publicKey = await getPublicKey();
        return jwt.verify(accessToken, publicKey, verifyOptions);
    } catch (err) {
        console.log({ jwtVerifyErrorMsg: err.message })
        return null;
    }
}

export function getPayloadFromToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}

const getPublicKey = async () => {
    if (!fs.existsSync('public.key')) {
        const response = await axios.get(`${process.env.OAUTH_URL}/pem`);

        console.log(response);
        await fs.promises.writeFile('public.key', response.data, 'utf-8');
        return response.data;
    }

    return await fs.promises.readFile('public.key', 'utf-8');
};