import { getDb } from '../db/client';
import { githubFailureLogs } from '../db/schema';

export async function uploadToGitHubDirect(env: any, params: {
  filePath: string;
  fileContent: string; // Base64
  commitMessage: string;
}) {
  const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = env;
  const apiUrl = `<https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${params.filePath}>`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CloudPress-Worker'
  };

  try {
    // 1. 기존 파일 SHA 확인
    const getRes = await fetch(apiUrl, { headers });
    let sha: string | undefined;
    if (getRes.ok) {
      const data: any = await getRes.json();
      sha = data.sha;
    }

    // 2. 업로드 실행
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.commitMessage,
        content: params.fileContent,
        sha,
        branch: 'main'
      })
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`GitHub API Error: ${putRes.status} - ${errorText}`);
    }

    const result: any = await putRes.json();
    return {
      url: `<https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/${params.filePath}>`,
      sha: result.content.sha
    };
  } catch (error: any) {
    // 실패 로그 기록 (D1)
    const db = getDb(env);
    await db.insert(githubFailureLogs).values({
      filePath: params.filePath,
      errorMessage: error.message,
      timestamp: new Date()
    }).run();
    throw error;
  }
}
