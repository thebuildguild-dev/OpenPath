import axios from 'axios';

const GITHUB_API = 'https://api.github.com';
const TIMEOUT = 12000;

function headers() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function get(url, params = {}) {
  try {
    const res = await axios.get(url, { headers: headers(), params, timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    const msg = err.response?.data?.message || err.message;
    throw new Error(`GitHub API error: ${msg}`);
  }
}

function decodeBase64(content) {
  try {
    return Buffer.from(content, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

export async function getRepoMetadata(owner, repo) {
  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}`);
  if (!data) throw new Error(`Repository "${owner}/${repo}" not found on GitHub`);

  return {
    owner,
    name: data.name,
    fullName: data.full_name,
    url: data.html_url,
    description: data.description || null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    defaultBranch: data.default_branch,
    primaryLanguage: data.language || null,
    topics: data.topics || [],
    license: data.license?.name || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getRepoIssues(owner, repo, options = {}) {
  const {
    state = 'open',
    limit = 20,
    labels = '',
    sort = 'updated',
    direction = 'desc',
  } = options;

  const params = {
    state,
    per_page: Math.min(Number(limit) || 20, 50),
    sort,
    direction,
  };
  if (labels) params.labels = labels;

  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}/issues`, params);
  if (!data) return [];

  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      url: issue.html_url,
      state: issue.state,
      labels: issue.labels.map((l) => l.name),
      assignees: issue.assignees.map((a) => a.login),
      comments: issue.comments,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    }));
}

export async function getReadme(owner, repo) {
  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}/readme`);
  if (!data?.content) return null;
  return decodeBase64(data.content);
}

export async function getTopLevelContents(owner, repo) {
  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}/contents`);
  if (!data) return [];
  return data.map((item) => ({ name: item.name, type: item.type, path: item.path }));
}

export async function getFileIfExists(owner, repo, path) {
  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`);
  if (!data?.content) return null;
  return decodeBase64(data.content);
}

export async function getRepoLanguages(owner, repo) {
  const data = await get(`${GITHUB_API}/repos/${owner}/${repo}/languages`);
  return data || {};
}
