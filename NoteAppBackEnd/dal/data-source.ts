import "reflect-metadata"
import { DataSource } from "typeorm"
import { Note } from "./entity/Note"
import 'dotenv/config';
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [Note],
    migrations: [],
    subscribers: [],
})
