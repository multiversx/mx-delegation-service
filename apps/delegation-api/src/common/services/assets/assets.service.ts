import { Injectable } from "@nestjs/common";
import fs from "fs";
import path from "path";
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { IdentityInfo } from "./models/identity.info";

@Injectable()
export class AssetsService {
  private LOCAL_GIT_PATH = 'dist/repos/mx-assets';


  async checkout(): Promise<void> {
    const options: Partial<SimpleGitOptions> = {
      baseDir: this.LOCAL_GIT_PATH,
      binary: 'git',
      maxConcurrentProcesses: 6,
    };
    const git: SimpleGit = simpleGit(options);

    await git.checkout('master');

    await git.pull('master');
  }

  getIdentityInfo(identity: string): IdentityInfo | null {
    const filePath = this.getIdentityInfoJsonPath(identity);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const info: IdentityInfo = JSON.parse(fs.readFileSync(filePath).toString());

    return info;
  }

  getIdentityAssetsPath(): string {
    return path.join(process.cwd(), this.LOCAL_GIT_PATH, this.getRelativePath('identities'));
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
