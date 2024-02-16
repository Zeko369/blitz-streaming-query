import { Suspense } from "react"
import Link from "next/link"
import Layout from "src/core/layouts/Layout"
import { BlitzPage } from "@blitzjs/next"
import styles from 'src/styles/Home.module.css'
import { getQueryKey, invalidateQuery, MutationFunction, MutationResultPair, useMutation, useQuery } from "@blitzjs/rpc"
import getTodos from "../todos/queries/getTodos"
import createTodoFn from "../todos/mutations/createTodo"
import { UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import SuperJSON from "superjson"

const useFancyMutation = (mutationResolver: MutationFunction<any, any>, revalidate: any[]): any => {
  const client = useQueryClient();
  const [fn, opts] = useMutation(mutationResolver);

  return [async (args) => {
    const result = await fn({args, revalidate});

    Object.entries(result.revalidationData).forEach(([key, value]) => {
      client.setQueryData(JSON.parse(key), SuperJSON.deserialize({json: value.result, meta: value.meta}));
    });

    return result['output'];
  }, opts] as const
}
const useFancyQuery = (queryResolver: any, options: any): any => {
  const [data, opts] = useQuery(queryResolver, options);
  return [data, {ref: getQueryKey(queryResolver, options), ...opts}] as const;
}

const Todos: BlitzPage = () => {
  const [todos, {isFetching, ref}] = useFancyQuery(getTodos, {foo: 10})
  const [createTodo, {isLoading}] = useFancyMutation(createTodoFn, [ref]);

  const [createTodoDumb, {isLoading : isLoading2}] = useMutation(createTodoFn);

  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault();
        await createTodo({text: e.currentTarget.text.value} as any);
      }}>
        <input name="text" />
        <input type="submit" value={(isLoading2 || isLoading) ? 'Loading...' : "Create Todo"}/>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
              {todo.text}
          </li>
        ))}
      </ul>

      {isFetching ? "Loading..." : null}
    </div>
  )
}

const Home: BlitzPage = () => {
return <Layout title="Home">
  <Suspense fallback="Loading...">
    <Todos />
  </Suspense>
</Layout>
}

export default Home
