import * as jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'CANDYMAN';

// Replace these with the seeded admin's email and any additional claims
const adminPayload = {
  email: 'maniesamuel@gmail.com', // Replace with the seeded admin's email
  role: 'admin',             // Add any role or claims as per your design
};

const token = jwt.sign(adminPayload, secret, { expiresIn: '1h' });

console.log('Generated JWT:', token);
