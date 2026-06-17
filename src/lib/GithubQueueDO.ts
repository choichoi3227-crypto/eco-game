import { getDb } from '../db/client';
import { githubFailureLogs } from '../db/schema';

export class GitHubQueueDO {
  state: DurableObjectState;
  env: any;
  nextAllowedTime: number = 0;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    const now = Date.now();
    if (now < this.nextAllowedTime) {
      await new Promise(r => setTimeout(r, this.nextAllowedTime - now));
    }

    const { filePath, fileContent, commitMessage } = await request.json();
    try {
      return await this.processUpload(filePath, fileContent, commitMessage);
    } catch (e: any) {
      const db = getDb(this.env);
      await db.insert(githubFailureLogs).values({
        filePath, errorMessage: e.message, timestamp: new Date()
      }).run();
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  private async processUpload(path: string, content: string, msg: string) {
    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = this.env;
    const url = `<https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}>`;
    const headers = { 
      'Authorization': `token ${GITHUB_TOKEN}`, 
      'Accept': 'application/vnd.github.v3+json', 
      'User-Agent': 'CloudPress' 
    };

    const getRes = await fetch(url, { headers });
    let sha = getRes.ok ? (await getRes.json()).sha : undefined;

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, content, sha, branch: 'main' })
    });

    const remain = parseInt(putRes.headers.get('X-RateLimit-Remaining') || '5000');
    if (remain < 100) {
      this.nextAllowedTime = parseInt(putRes.headers.get('X-RateLimit-Reset') || '0') * 1000;
    }

    const result: any = await putRes.json();
    return new Response(JSON.stringify({ url: result.content.download_url, sha: result.content.sha }));
  }
}
