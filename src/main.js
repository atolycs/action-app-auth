const core = require('@actions/core');
const { App } = require('octokit');
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

    core.setSecret(data.id)
    core.info(`==> Get User Installation ID: ${data.id}`);
    //core.info(auth_user_token.token)

    const app = new App({
      appId: appID,
      privateKey: privateKey,
    });

    const octokit = await app.getInstallationOctokit(data.id);

    /*    core.info("==> Generating Temporary Token")
    const auth_user_token = await auth({
      type: "installation",
      installationId: data.id
    })*/

    core.info('==> Getting Bot user data');

    let app_info = (await octokit.rest.apps.getAuthenticated()).data

    const bot_name = `${app_info.slug}[bot]`;
    core.info(bot_name)

    let app_user_result = (await octokit.request(
      `GET /users/{username}`,
    {
      username: bot_name
    })).data;

    core.info(app_user_result)

  } catch (error) {
    core.setFailed(error);
  }
}

run();
