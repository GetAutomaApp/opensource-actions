const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const semver = require("semver");

class ReleaseAction {
  constructor(token, configPath, assetsPath) {
    this.token = token;
    this.configPath = configPath;
    this.assetsPath = assetsPath;
    this.octokit = github.getOctokit(token);
    this.context = github.context;
    this.placeholders = {};
    this.description = "";
    this.previousTag = null;
  }

  async loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Config file not found: ${this.configPath}`);
    }
    this.config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
  }

  async buildPlaceholders() {
    const latestCommit = await this.octokit.rest.repos.getCommit({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      ref: this.context.sha
    });

    this.placeholders["commit-sha"] = this.context.sha;
    this.placeholders["commit-short-sha"] = this.context.sha.substring(0, 7);
    this.placeholders["commit-message"] = latestCommit.data.commit.message;
    this.placeholders["commit-author"] = latestCommit.data.commit.author.name;
    this.placeholders["commit-content"] = latestCommit.data.commit.message;
  }

  async resolvePlaceholder(key) {
    return this.placeholders[key] || "";
  }

  async replacePlaceholders(str) {
    const matches = str.match(/\{([a-zA-Z0-9\-]+)\}/g);
    if (!matches) return str;

    let result = str;
    for (const match of matches) {
      const key = match.slice(1, -1);
      const value = await this.resolvePlaceholder(key);
      result = result.replace(match, value);
    }
    return result;
  }

  async determineBump() {
    let bumpRaw = this.config.bump || "patch";
    bumpRaw = await this.replacePlaceholders(bumpRaw);

    const validBumps = ["major", "minor", "patch", "pre-release"];
    this.bump = validBumps.includes(bumpRaw) ? bumpRaw : "patch";
  }

  async getLatestTag() {
    const tags = await this.octokit.rest.repos.listTags({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      per_page: 100
    });

    const sortedTags = tags.data
      .map(t => t.name)
      .filter(t => semver.valid(t))
      .sort(semver.rcompare);

    this.latestTag = sortedTags[0] || null;
    return this.latestTag;
  }

  async determineNewVersion() {
    let baseVersion = "0.0.0";
    if (!this.latestTag) {
      await this.getLatestTag();
    }
    if (this.latestTag) baseVersion = this.latestTag;

    this.newVersion = semver.inc(baseVersion, this.bump);
    this.tag = `v${this.newVersion}`;

    this.placeholders["action-new-version"] = this.newVersion;
    this.placeholders["action-tag"] = this.tag;
  }

  async buildTitle() {
    let title = this.config.title || null;
    if (title) title = await this.replacePlaceholders(title);
    else title = this.tag;

    this.title = title;
  }

  async getPreviousTag() {
    const tags = await this.octokit.rest.repos.listTags({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      per_page: 100
    });

    const sortedTags = tags.data
      .map(t => t.name)
      .filter(t => semver.valid(t))
      .sort(semver.rcompare);

    const prev = sortedTags.find(t => semver.lt(t, this.newVersion));
    this.previousTag = prev || null;
  }

  async addCommitsSinceLastRelease() {
    const sinceSha = this.previousTag || null;

    const commits = await this.octokit.rest.repos.listCommits({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      sha: this.context.sha
    });

    this.description += "\n\n### Commits included\n";
    commits.data.forEach(c => {
      this.description += `- ${c.commit.message} (${c.sha.substring(0, 7)})\n`;
    });
  }

  async addNewContributors() {
    const commits = await this.octokit.rest.repos.listCommits({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      sha: this.context.sha
    });

    const contributors = new Set();
    commits.data.forEach(c => {
      if (c.author && c.author.login) contributors.add(c.author.login);
    });

    if (contributors.size > 0) {
      this.description += "\n\n### New contributors\n";
      contributors.forEach(u => (this.description += `- @${u}\n`));
    }
  }

  async addDiffFromPreviousRelease() {
    if (!this.previousTag) return;

    const commits = await this.octokit.rest.repos.listCommits({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      sha: this.context.sha
    });

    if (commits.data.length > 0) {
      this.description += `\n\n### Diff from previous release (${this.previousTag})\n`;
      commits.data.forEach(c => {
        this.description += `- ${c.commit.message} (${c.sha.substring(0, 7)})\n`;
      });

      this.description += `\n[Compare changes](https://github.com/${this.context.repo.owner}/${this.context.repo.repo}/compare/${this.previousTag}...${this.tag})\n`;
    }
  }

  async applyDescriptorMappings() {
    const descriptorMappings = {
      "commits": this.addCommitsSinceLastRelease.bind(this),
      "new-contributors": this.addNewContributors.bind(this),
      "diff-from-previous-release": this.addDiffFromPreviousRelease.bind(this),
    };

    if (Array.isArray(this.config["description-adders"])) {
      for (const desc of this.config["description-adders"]) {
        const fn = descriptorMappings[desc];
        if (fn) await fn();
      }
    }
  }

  async buildDescription() {
    if (this.config.description) {
      this.description = await this.replacePlaceholders(this.config.description);
    }
    await this.getPreviousTag();
    await this.applyDescriptorMappings();
  }

  async createRelease() {
    const release = await this.octokit.rest.repos.createRelease({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      tag_name: this.tag,
      name: this.title,
      body: this.description,
      draft: false,
      prerelease: this.bump === "pre-release"
    });

    if (fs.existsSync(this.assetsPath)) {
      const files = fs.readdirSync(this.assetsPath);
      for (const file of files) {
        const filePath = path.join(this.assetsPath, file);
        const data = fs.readFileSync(filePath);
        await this.octokit.rest.repos.uploadReleaseAsset({
          url: release.data.upload_url,
          headers: {
            "content-type": "application/octet-stream",
            "content-length": data.length
          },
          name: file,
          data
        });
      }
    }

    core.setOutput("release-url", release.data.html_url);
    core.setOutput("release-id", release.data.id);
  }

  async run() {
    await this.loadConfig();
    await this.determineBump();
    this.determineNewVersion();
    await this.buildPlaceholders();
    await this.buildTitle();
    await this.buildDescription();
    await this.createRelease();
  }
}

const action = new ReleaseAction(
  process.env.GITHUB_TOKEN,
  process.env.CONFIG_PATH,
  process.env.ASSETS_PATH
);

action.run().catch(err => core.setFailed(err.message));
