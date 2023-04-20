const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');

const graphiqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use(
    '/graphql', 
    graphqlHTTP({
        schema: graphiqlSchema,
        rootValue: graphqlResolvers,
        graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@staradmin.yfsea3q.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=> {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})

