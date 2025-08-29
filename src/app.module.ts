import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlayersModule } from './players/players.module';
import { MarketModule } from './market/market.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    // Serve static files from public directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PlayersModule,
    MarketModule,
    EventsModule,
    AdminModule,
    TeamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}