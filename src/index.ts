import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import mikroOrmConfig from './mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  const post = orm.em.create(Post, {title: 'First post '});
  await orm.em.persistAndFlush(post);
  await orm.em.nativeInsert(Post,{title:'post 2 '})
}

console.log("hello world");

main().catch(err =>{
  console.log(err);
})