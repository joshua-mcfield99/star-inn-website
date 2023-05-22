const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');
const { user } = require('./merge');

const transformEvent = event => {
    return {
        ...event._doc, 
        _id: event.id,
        date: dateToString(event._doc.date), 
        creator: user.bind(this, event.creator)
    };
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return transformEvent(event);
            });
        } catch(err) {
            throw err;
        }
    },
    createEvent: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!')
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            date: dateToString(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;
        try {
            result = await event
            .save()
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId)
            if(!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        } catch(err) {
            console.log(err);
            throw err;
        }; 
    },
    deleteEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        try {
            // Find the event by title and delete it
            const deletedEvent = await Event.findOneAndDelete({ title: args.title });
            
            if (!deletedEvent) {
                throw new Error('Event not found.');
            }
            
            // Remove the deleted event from the creator's createdEvents list
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.pull(deletedEvent);
            await creator.save();
            
            return transformEvent(deletedEvent);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}