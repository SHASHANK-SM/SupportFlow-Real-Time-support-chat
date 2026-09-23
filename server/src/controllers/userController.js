import {asyncHandler} from '../utils/asyncHandler.js';import {ok} from '../utils/apiResponse.js';import * as users from '../services/userService.js';
export const createAgent=asyncHandler(async(req,res)=>ok(res,await users.createAgent(req.body),'Support agent created',201));
export const listAgents=asyncHandler(async(req,res)=>ok(res,await users.listAgents()));
export const updateAgent=asyncHandler(async(req,res)=>ok(res,{user:await users.updateAgent(req.params.id,req.body)},'Agent updated'));
export const deleteAgent=asyncHandler(async(req,res)=>ok(res,await users.deleteAgent(req.params.id),'Agent deleted'));
export const setAgentAvailability=asyncHandler(async(req,res)=>ok(res,await users.updateAgentAvailability(req.params.id,req.body.availability),'Availability updated'));
export const setAvailability=asyncHandler(async(req,res)=>ok(res,await users.updateAvailability(req.user,req.body.availability),'Availability updated'));
export const updateProfile=asyncHandler(async(req,res)=>ok(res,{user:await users.updateProfile(req.user,req.body)},'Profile updated'));
