import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars'
import { asNexusMethod, makeSchema } from 'nexus'
import { join } from 'path'

import * as allTypes from './schema/index'

export const schema = makeSchema({
  outputs: {
    schema: join(process.cwd(), 'graphql/gen', 'schema.graphql'),
    typegen: join(
      process.cwd(),
      'node_modules',
      '@types',
      'nexus-typegen',
      'index.d.ts',
    ),
  },
  types: [
    allTypes,
    asNexusMethod(GraphQLBigInt, 'bigint', 'bigint'),
    asNexusMethod(GraphQLDateTime, 'datetime', 'Date'),
  ],
  contextType: {
    module: join(process.cwd(), 'graphql', 'context.ts'),
    export: 'Context',
  },
})
