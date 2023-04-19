const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();


app.use(bodyParser.json());

//add extra fields later after data and types setup and testing

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery 
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return {...event._doc, _id: event.id};
                })
            })
            .catch(err => {
                console.log(err);
                throw err;
            })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                date: new Date(args.eventInput.date)
            });
            return event
            .save()
            .then(result => {
                console.log(result);
                return {...result._doc, _id: event.id};
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
            
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@staradmin.yfsea3q.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=> {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})

