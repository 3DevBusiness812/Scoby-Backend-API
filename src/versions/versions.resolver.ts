import { Query, Resolver } from '@nestjs/graphql';
import { VersionObject } from './versions.graphql';
import { VersionsService } from './versions.service';

@Resolver(() => VersionObject)
export class VersionsResolver {
  constructor(private versionsService: VersionsService) {}

  @Query(() => VersionObject)
  getVersion(): VersionObject {
    return {
      version: this.versionsService.getVersion(),
    };
  }
}
