import { UserCollection } from '../db/models/User.js';

export const getUser = (someFilter) => UserCollection.findOne(someFilter);
