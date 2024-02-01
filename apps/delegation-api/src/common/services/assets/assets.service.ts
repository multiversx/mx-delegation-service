import { Injectable, Logger } from "@nestjs/common";
import fs from "fs";
import path from "path";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { IdentityInfo } from "./models/identity.info";

@Injectable()
export class AssetsService {
  private readonly logger: Logger;
  private LOCAL_GIT_PATH = 'dist/repos/assets';
  private REMOTE_GIT_PATH = 'https://github.com/multiversx/mx-assets.git'

  constructor() {
    this.logger = new Logger(AssetsService.name);
  }

  async checkout(): Promise<void> {
    fs.rmdirSync(this.LOCAL_GIT_PATH, { recursive: true });

    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
    };
    const git: SimpleGit = simpleGit(options);

    await git.clone(this.REMOTE_GIT_PATH, this.LOCAL_GIT_PATH);
  }

  getIdentityInfo(identity: string): IdentityInfo | null {
    const filePath = this.getIdentityInfoJsonPath(identity);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const info: IdentityInfo = JSON.parse(fs.readFileSync(filePath).toString());

    return info;
  }

  private getIdentityAssetsPath(): string {
    return path.join(process.cwd(), 'dist/repos/assets', this.getRelativePath('identities'));
  }

  private getIdentityInfoJsonPath(identity: string): string {
    return path.join(this.getIdentityAssetsPath(), identity, 'info.json');
  }

  private getRelativePath(name: string): string {
    const network = process.env.NODE_ENV;
    if (network !== 'production' && network !== 'mainnet') {
      return path.join(network, name);
    }

    return name;
  }
}
