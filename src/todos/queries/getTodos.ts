import { resolver } from "@blitzjs/rpc";
import { z } from "zod";

import db from "db";

const getTodosSchema = z.object({})

const getTodos = resolver.pipe(
  resolver.zod(getTodosSchema),
  async (args, ctx) => {
    // await new Promise((resolve) => setTimeout(resolve, 500));

    return db.todo.findMany({orderBy: {id: 'desc'}});
  }
);

export default getTodos;
