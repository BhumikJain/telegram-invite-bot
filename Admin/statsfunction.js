const User = require('../userModel');
const moment = require('moment-timezone');


// FUNCTION TO UPDATE LAST INTERACTION TIME OF THE USER 
async function updateLastInteraction(userId) {
    try {
        const user = await User.findOne({ userId });
        // console.log('User found:', user); 
        if (user) {
            const currentTimeIST = moment().tz('Asia/Kolkata');
            user.lastInteraction = currentTimeIST;
            await user.save();
            // console.log(`User ID ${userId} last interaction updated to: ${currentTimeIST.format()}`);
        }
    } catch (error) {
        console.error('Error updating last interaction time:', error);
    }
}


// FUNCTION TO MARK USER AS DELETED IF THE USER NOT INTERACT WITH BOT IN 31 DAYS ACCORDING TO THE LAST INTERACTION TIME OF THE USER
async function checkInactiveUsers() {
    try {
        const inactiveTimeLimit = 2678400000;
        const currentTime = moment().valueOf();

        const inactiveUsers = await User.find({
            lastInteraction: { $lt: currentTime - inactiveTimeLimit },
            active: true,
            deleted: false
        });

        for (const user of inactiveUsers) {
            user.active = false;
            user.deleted = true;
            await user.save();
            // console.log(`User ID ${user.userId} marked as inactive and deleted due to inactivity.`);
        }
    } catch (error) {
        console.error('Error checking inactive users:', error);
    }
}


// FUNCTION TO MARK THE USER TO ACTIVE AGAIN IF THE USER INTERACT WITH BOT AFTER 31 DAYS (AND THE USER MARK AS DELETED)
async function updateUserStatus(userId) {
    try {
        const user = await User.findOne({ userId });

        if (user && !user.active && user.deleted) {
            user.active = true;
            user.deleted = false;
            await user.save();
            // console.log(`User ID ${userId} status updated to active.`);
        }
    } catch (error) {
        console.error('Error updating user status:', error);
    }
}


module.exports = { updateLastInteraction, checkInactiveUsers, updateUserStatus };
