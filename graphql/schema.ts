import { queryType, makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'
import path from 'path'

const Query = queryType({
  definition(t) {
    t.string('hello', { resolve: () => 'hello world' })
  },
})

export const schema = makeSchema({
  types: [Query],
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      outputs: {
        typegen: path.join(process.cwd(), 'graphql', 'nexus-prisma.gen.d.ts'),
      },
    }),
  ],
  outputs: {
    typegen: path.join(process.cwd(), 'graphql', 'nexus.gen.d.ts'),
    schema: path.join(process.cwd(), 'graphql', 'schema.graphql'),
  },
  contextType: {
    module: path.join(process.cwd(), 'graphql', 'context.ts'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
