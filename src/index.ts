import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from "cors";


const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name:'qid',
      store: new RedisStore({ 
        client: redisClient,
        //disableTTL:true,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //ten years
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure:__prod__, //cookie only works in https
      },
      saveUninitialized: false,
      secret: 'sajdkhasjkdhsajkdh',
      resave:false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver,UserResolver],
      validate:false,
    }),
    context: ({ req, res }) => ({em:orm.em, req, res})
  });

  apolloServer.applyMiddleware({ 
    app,
    cors: false,//{ origin: "http://localhost:3000" },
  });

  app.get('/', (_,res)=>{
    res.send("Hello");
  });

  app.listen(4000, ()=> {
    console.log('server on port 4000')
  });

  //const post = orm.em.create(Post, { title: 'First post ' });
  //await orm.em.persistAndFlush(post);
  //await orm.em.nativeInsert(Post, { title: 'post 2 ' })
  //const posts = await orm.em.find(Post,{});
  //console.log(posts);
}

console.log("hello world");

main().catch(err =>{
  console.log(err);
})
