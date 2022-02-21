import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamResolver } from './team.resolver';
import { JwtModule } from 'src/lib/jwt/jwt.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { S3Module } from '../lib/s3/s3.module';
import { ImageProcessorModule } from '../lib/image-processor/image-processor.module';
import { TeamMembersResolver } from './teamMembers.resolver';
import { ActivityModule } from 'src/activity/activity.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        JwtModule,
        NotificationsModule,
        S3Module,
        ImageProcessorModule,
        ActivityModule,
        UsersModule
    ],
    providers: [TeamService, TeamResolver, TeamMembersResolver],
    exports: [TeamService]
})
export class TeamModule {}
