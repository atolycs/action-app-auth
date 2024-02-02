const core = require('@actions/core');
const { App } = require('octokit');
const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');

async function run() {
  try {
    const appID = core.getInput('appID', { required: true });
    const privateKey = core.getInput('privateKey', { required: true });
    //const repo_info = process.env.GITHUB_REPOSITORY
    let codeOwner, parsedRepository;
    [codeOwner, parsedRepository] = String(process.env.GITHUB_REPOSITORY).split('/');
    //const codeOwner = process.env.GITHUB_REPOSITORY_OWNER;
    //const parsedRepository = process.env.GITHUB_REPOSITORY.split('/')[1];

    core.info('==> Setup Token...');

    // Create App Authentication

    const auth = createAppAuth({
      appId: appID,
      privateKey: privateKey,
      request: request.defaults(),
    });

    core.debug('===> Auth setup.');

    const auth_app_token = await auth({
      type: 'app',
    });

    core.info(`App Token Generated: ${auth_app_token.token}`);
    core.info(`==> Bot user infomation setup`);
    let { data } = await request('GET /users/{username}/installation', {
      username: codeOwner,
      request: {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          authorization: auth_app_token.token,
        },
        hook: auth.hook,
      },
    });

    core.setSecret(data.id);
    core.info(`==> Get User Installation ID: ${data.id}`);
    //core.info(auth_user_token.token)

    const app = new App({
      appId: appID,
      privateKey: privateKey,
    });

    const octokit = await app.getInstallationOctokit(data.id);

    core.info('==> Getting Bot user data');

    let app_info = (await octokit.rest.apps.getAuthenticated()).data;

    const bot_name = `${app_info.slug}[bot]`;

    let app_user_result = (
      await octokit.request(`GET /users/{username}`, {
        username: bot_name,
      })
    ).data;

    const bot_user_id = app_user_result.id;
    const bot_user_name = app_user_result.login;
    const bot_commit_address = `${bot_user_id}+${bot_user_name}@users.noreply.github.com`;

    core.info(`==> Bot commitor setuped`);
    core.info(`==> Commit Name: ${bot_user_name}`);
    core.info(`==> Commit-Address: ${bot_commit_address}`);

    core.info(`==> Revoke User Installation Token`);
    octokit.rest.apps.revokeInstallationAccessToken();

    core.info(`==> Token revoked`);
    core.info(`==> Generating Repository Token`);

    const response = await request('GET /repos/{owner}/{repo}/installation', {
      owner: codeOwner,
      repo: parsedRepository,
      request: {
        hook: auth.hook,
      },
    });

    const authentication = await auth({
      type: 'installation',
      installationId: response.data.id,
      repositoryNames: parsedRepository.split(','),
    });

    core.info(`==> Token generated`);
    core.setSecret(authentication.token);
    core.setOutput('token', authentication.token);
    core.setOutput('commit_name', bot_user_name);
    core.setOutput('commit_address', bot_commit_address);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
