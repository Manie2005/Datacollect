"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || 'CANDYMAN';
const adminPayload = {
    email: 'maniesamuel@gmail.com',
    role: 'admin',
};
const token = jwt.sign(adminPayload, secret, { expiresIn: '1h' });
console.log('Generated JWT:', token);
//# sourceMappingURL=generate-token.js.map