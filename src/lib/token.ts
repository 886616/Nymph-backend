import jwt from 'jsonwebtoken';
import "../../env";
import { INVALID_TOKEN, TOKEN_SHOULD_NOT_BE_EMPTY } from '../constants/general';

const jwtSecret = process.env.JWT_SECRET;
const tokenExpirePeriod = process.env.JWT_TOKEN_EXPIRE_PERIOD;

/**
 * Generate JWT Token
 * @param {object} payLoad - The payload to encode in the JWT.
 * @param {string} expiresIn
 * @returns {Promise<string>} - A Promise that resolves to the generated token.
 * @throws {TypeError} - Throws if the payload is not an object or is empty.
 */
export async function generateToken(payLoad: object, expiresIn: string | undefined = tokenExpirePeriod): Promise<string> {
    if (!payLoad || typeof payLoad !== 'object') {
        throw new TypeError('Token Payload Must Be An Object and Should Not Be Empty');
    }

    return new Promise((resolve, reject) => {
        jwt.sign(payLoad, jwtSecret, { expiresIn } as jwt.SignOptions, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token as string);
            }
        });
    });
}

// Verify JWT Token
export async function verifyToken(token: string): Promise<object | string> {
    if (!token) {
        throw new Error(TOKEN_SHOULD_NOT_BE_EMPTY);
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, jwtSecret, (error, decodedToken) => {
            if (error) {
                reject(new Error(INVALID_TOKEN));
            } else {
                resolve(decodedToken as object | string);
            }
        });
    });
}
