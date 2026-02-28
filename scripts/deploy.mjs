import { exec } from "node:child_process";
import util from "node:util";
import prompts from "prompts";
import kleur from "kleur";

const execAsync = util.promisify(exec);

/**
 * 执行 git 命令并返回 stdout（去除首尾空白）
 */
async function runGitCommand(cmd) {
  try {
    const { stdout } = await execAsync(cmd, { cwd: process.cwd() });
    return stdout.trim();
  } catch (error) {
    throw new Error(
      `Git command failed: ${cmd}\n${error.stderr || error.message}`,
    );
  }
}

// 确认在 git 仓库中
async function ensureGitRepo() {
  try {
    await execAsync("git rev-parse --git-dir", { cwd: process.cwd() });
  } catch {
    console.error(kleur.red("Error: Not inside a Git repository."));
    process.exit(1);
  }
}

// 获取当前分支
async function getCurrentBranch() {
  try {
    const branch = await runGitCommand("git rev-parse --abbrev-ref HEAD");
    if (branch === "HEAD") {
      console.error(
        kleur.red("Error: You are in detached HEAD state. Switch to a branch."),
      );
      process.exit(1);
    }
    return branch;
  } catch (error) {
    console.error(
      kleur.red(`Error: Failed to get current branch: ${error.message}`),
    );
    process.exit(1);
  }
}

// 获取远程 URL
async function getRemoteUrl(remote) {
  try {
    return await runGitCommand(`git remote get-url ${remote}`);
  } catch {
    console.error(kleur.red(`Error: Remote '${remote}' not found.`));
    process.exit(1);
  }
}

// 问答式确认是否加入到暂存区，并请求提交信息
async function stageAndCommit() {
  const { shouldStageAll } = await prompts({
    type: "confirm",
    name: "shouldStageAll",
    message: "Add all files to staging area? (git add .)",
    initial: true,
  });

  if (typeof shouldStageAll !== "boolean") {
    console.log(kleur.yellow("Deploy cancelled."));
    return false;
  }

  if (!shouldStageAll) {
    return true;
  }

  try {
    await runGitCommand("git add .");
  } catch (error) {
    console.error(kleur.red(`Error: Failed to stage files: ${error.message}`));
    process.exit(1);
  }

  const { commitMessage } = await prompts({
    type: "text",
    name: "commitMessage",
    message: "Commit message:",
    validate: (value) =>
      value.trim().length > 0 ? true : "Commit message cannot be empty",
  });

  if (!commitMessage || !commitMessage.trim()) {
    console.log(kleur.yellow("Deploy cancelled."));
    return false;
  }

  try {
    const safeCommitMessage = commitMessage.replace(/"/g, '\\"');
    await runGitCommand(`git commit -m "${safeCommitMessage}"`);
    console.log(kleur.green("Commit created successfully."));
  } catch (error) {
    const message = error.message || "";
    if (
      message.includes("nothing to commit") ||
      message.includes("no changes added to commit")
    ) {
      console.log(kleur.yellow("Nothing to commit, continuing deploy."));
      return true;
    }
    console.error(kleur.red(`Error: Commit failed: ${message}`));
    process.exit(1);
  }

  return true;
}

// 部署到远端仓库
export async function deploy() {
  console.log(kleur.bold().blue("\nDeploying via git\n"));

  await ensureGitRepo();

  const currentBranch = await getCurrentBranch();
  const remote = "origin";
  const remoteUrl = await getRemoteUrl(remote);

  console.log(kleur.cyan(`Remote: ${remote} -> ${remoteUrl}`));
  console.log(kleur.cyan(`Branch: ${currentBranch}`));

  // 获取 git 信息
  let status;
  try {
    status = await runGitCommand("git status --porcelain"); // 比较干净的 status 输出
  } catch (error) {
    console.error(
      kleur.red(`Error: Failed to check git status: ${error.message}`),
    );
    process.exit(1);
  }

  // 提示有未提交/未暂存的文件
  if (status) {
    console.log(kleur.yellow("\nYou have uncommitted changes:"));
    console.log(
      status
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n"),
    );

    const canContinue = await stageAndCommit();
    if (!canContinue) {
      return;
    }
  }

  const { confirmPush } = await prompts({
    type: "confirm",
    name: "confirmPush",
    message: `Push branch '${currentBranch}' to remote '${remote}'?`,
    initial: true,
  });

  if (!confirmPush) {
    console.log(kleur.yellow("Deploy cancelled."));
    return;
  }

  console.log(kleur.cyan(`\nPushing to ${remote}/${currentBranch}...`));

  try {
    const { stdout, stderr } = await execAsync(
      `git push ${remote} ${currentBranch}`,
      { cwd: process.cwd() },
    );
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(kleur.yellow(stderr));
    }
    console.log(kleur.green("\nDeployed successfully!"));
  } catch (error) {
    console.error(
      kleur.red(`\nError: Push failed:\n${error.stderr || error.message}`),
    );
    process.exit(1);
  }
}
