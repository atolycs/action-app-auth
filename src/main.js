const core = require('@actions/core');
const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');

async function run() {
  try {
    const appID = core.getInput('appID', { required: true });
    const privateKey = core.getInput('privateKey', { required: true });
    //const repo_info = process.env.GITHUB_REPOSITORY

    const codeOwner = process.env.GITHUB_REPOSITORY_OWNER;
    //const codeOwner = repo_info.split("/")[0]
    //const repo_name = repo_info.split("/")[1]

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

    core.info(data)
  } catch (error) {
    core.setFailed(error);
  }
}

run();
