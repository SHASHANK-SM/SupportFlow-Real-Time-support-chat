import jwt from 'jsonwebtoken'; import {env} from '../config/env.js'; export const generateToken=(user)=>jwt.sign({userId:user._id,role:user.role},env.jwtSecret,{expiresIn:env.jwtExpiresIn});
