import { DB } from "./db";

/* DEVELOPER NOTES:
* Here we are literally just grabbing the first user 
* in a mock list of users for the sample app
* This is where your app would have already authenticated the user
* and provided the details/data about that user to 
* the other services/portions of the application
*/
export function getLoggedInUser(db : DB) {
    return db.users[0];
}