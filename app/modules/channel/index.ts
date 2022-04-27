import { db } from "~/db.server"

export const getAllChannels = () => db.channel.findMany()
