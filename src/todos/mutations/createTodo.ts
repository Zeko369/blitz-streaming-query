import { resolver } from "@blitzjs/rpc";
import { z } from "zod";

import db from "db";

const createTodoSchema = z.object({
  args: z.object({text: z.string()}),
  revalidate: z.any(),
})

const tmp = z.object({args: z.any(), revalidate: z.any()})

const handleRevalidations = <T extends z.infer<typeof tmp>, C, K>(fn: (args: T['args'], ctx: C) => Promise<K>) => async (args: T, ctx: C): Promise<K> => {
  const output = await fn(args.args, ctx)

  const revalidationData = {};
  await Promise.all(args.revalidate.map(async ([path, args]) => {
    const res = await fetch(`http://localhost:3000${path}`, {
      method: 'POST',
      body: JSON.stringify({meta: {}, params: args.json}),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    revalidationData[JSON.stringify([path, args])] = await res.json();
  }))

  return {output, revalidationData} as K
}

const createTodoFn = resolver.pipe(
  resolver.zod(createTodoSchema),
  handleRevalidations(async (args, ctx) => {
    // await new Promise((resolve) => setTimeout(resolve, 500));

    return db.todo.create({data: args});
  })
);

export default createTodoFn;
