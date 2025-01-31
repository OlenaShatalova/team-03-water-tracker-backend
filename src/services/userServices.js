import { UserCollection } from '../db/models/User.js';

export const getUser = (filter) => UserCollection.findOne(filter);
