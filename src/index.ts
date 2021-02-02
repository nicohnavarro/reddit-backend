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
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver,UserResolver],
      validate:false,
    }),
    context: () => ({em:orm.em})
  })

  apolloServer.applyMiddleware({ app });

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