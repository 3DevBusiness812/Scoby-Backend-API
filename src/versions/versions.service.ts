import { Injectable } from '@nestjs/common';
import projectPackage from '../../package.json';

@Injectable()
export class VersionsService {
  getVersion(): string {
    return projectPackage.version;
  }
}
