import 'reflect-metadata';

import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'postgres',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, Updoot],
    });
    
    await conn.runMigrations();

    //  await Post.delete({})

    // const app = express();
    // app.get ('/', (_, res) => {
    //     res.send('hello')
    // })

    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis()
    //console.log('redis', RedisStore)
    app.use(cors({
        origin: 'http://localhost:3005',
        credentials: true,
        })
    );

    app.use(
    session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redis,
            // disableTTL: true,
            disableTouch: true,
        }),
        cookie: {
            //10 years
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__,
        },
       
        saveUninitialized: false,
        secret: 'randomfornow',
        resave: false,
    })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader(),
        }),
    })

    apolloServer.applyMiddleware({ 
        app, 
        cors: false
    });

    app.listen(4000, () => {
        console.log('server started on localhost: 4000')
    } )
   
}

main().catch((err) => {
    console.error(err)
});

