import * as Typegen from 'nexus-plugin-prisma/typegen'
import * as Prisma from '@prisma/client';

// Pagination type
type Pagination = {
    first?: boolean
    last?: boolean
    before?: boolean
    after?: boolean
}

// Prisma custom scalar names
type CustomScalars = 'DateTime'

// Prisma model type definitions
interface PrismaModels {
  Channel: Prisma.Channel
  ChannelGroup: Prisma.ChannelGroup
  Video: Prisma.Video
}

// Prisma input types metadata
interface NexusPrismaInputs {
  Query: {
    channels: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'title' | 'thumbnail' | 'description' | 'publishedAt' | 'Videos' | 'ChannelGroup'
      ordering: 'id' | 'title' | 'thumbnail' | 'description' | 'publishedAt' | 'Videos' | 'ChannelGroup'
    }
    channelGroups: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'title' | 'description' | 'Channels'
      ordering: 'id' | 'title' | 'description' | 'Channels'
    }
    videos: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'channelId' | 'channel' | 'publishedAt' | 'title' | 'description' | 'thumbnail' | 'liveStatus' | 'uploadStatus' | 'privacyStatus' | 'duration'
      ordering: 'id' | 'channelId' | 'channel' | 'publishedAt' | 'title' | 'description' | 'thumbnail' | 'liveStatus' | 'uploadStatus' | 'privacyStatus' | 'duration'
    }
  },
  Channel: {
    Videos: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'channelId' | 'channel' | 'publishedAt' | 'title' | 'description' | 'thumbnail' | 'liveStatus' | 'uploadStatus' | 'privacyStatus' | 'duration'
      ordering: 'id' | 'channelId' | 'channel' | 'publishedAt' | 'title' | 'description' | 'thumbnail' | 'liveStatus' | 'uploadStatus' | 'privacyStatus' | 'duration'
    }
    ChannelGroup: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'title' | 'description' | 'Channels'
      ordering: 'id' | 'title' | 'description' | 'Channels'
    }
  }
  ChannelGroup: {
    Channels: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'title' | 'thumbnail' | 'description' | 'publishedAt' | 'Videos' | 'ChannelGroup'
      ordering: 'id' | 'title' | 'thumbnail' | 'description' | 'publishedAt' | 'Videos' | 'ChannelGroup'
    }
  }
  Video: {

  }
}

// Prisma output types metadata
interface NexusPrismaOutputs {
  Query: {
    channel: 'Channel'
    channels: 'Channel'
    channelGroup: 'ChannelGroup'
    channelGroups: 'ChannelGroup'
    video: 'Video'
    videos: 'Video'
  },
  Mutation: {
    createOneChannel: 'Channel'
    updateOneChannel: 'Channel'
    updateManyChannel: 'AffectedRowsOutput'
    deleteOneChannel: 'Channel'
    deleteManyChannel: 'AffectedRowsOutput'
    upsertOneChannel: 'Channel'
    createOneChannelGroup: 'ChannelGroup'
    updateOneChannelGroup: 'ChannelGroup'
    updateManyChannelGroup: 'AffectedRowsOutput'
    deleteOneChannelGroup: 'ChannelGroup'
    deleteManyChannelGroup: 'AffectedRowsOutput'
    upsertOneChannelGroup: 'ChannelGroup'
    createOneVideo: 'Video'
    updateOneVideo: 'Video'
    updateManyVideo: 'AffectedRowsOutput'
    deleteOneVideo: 'Video'
    deleteManyVideo: 'AffectedRowsOutput'
    upsertOneVideo: 'Video'
  },
  Channel: {
    id: 'String'
    title: 'String'
    thumbnail: 'String'
    description: 'String'
    publishedAt: 'DateTime'
    Videos: 'Video'
    ChannelGroup: 'ChannelGroup'
  }
  ChannelGroup: {
    id: 'Int'
    title: 'String'
    description: 'String'
    Channels: 'Channel'
  }
  Video: {
    id: 'String'
    channelId: 'String'
    channel: 'Channel'
    publishedAt: 'DateTime'
    title: 'String'
    description: 'String'
    thumbnail: 'String'
    liveStatus: 'String'
    uploadStatus: 'String'
    privacyStatus: 'String'
    duration: 'Int'
  }
}

// Helper to gather all methods relative to a model
interface NexusPrismaMethods {
  Channel: Typegen.NexusPrismaFields<'Channel'>
  ChannelGroup: Typegen.NexusPrismaFields<'ChannelGroup'>
  Video: Typegen.NexusPrismaFields<'Video'>
  Query: Typegen.NexusPrismaFields<'Query'>
  Mutation: Typegen.NexusPrismaFields<'Mutation'>
}

interface NexusPrismaGenTypes {
  inputs: NexusPrismaInputs
  outputs: NexusPrismaOutputs
  methods: NexusPrismaMethods
  models: PrismaModels
  pagination: Pagination
  scalars: CustomScalars
}

declare global {
  interface NexusPrismaGen extends NexusPrismaGenTypes {}

  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = Typegen.GetNexusPrisma<TypeName, ModelOrCrud>;
}
  