import { Module, Global } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseConfig } from './database.config';

export const DRIZZLE = Symbol("DRIZZLE_CONNECTION");

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            useFactory: (config: ConfigType<typeof databaseConfig>) => {
                const pool = new Pool({
                    connectionString: config.url,
                });
                return drizzle(pool);
            },
            inject: [databaseConfig.KEY],
        },
    ],
    exports: [DRIZZLE],
})
export class DatabaseModule {}