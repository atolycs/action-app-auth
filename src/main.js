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

    const auth = createAppAuth({
      appId: appID,
      privateKey: privateKey,
      request: request.defaults(),
    });

    core.debug('===> auth setup.');

    const auth_app_token = await auth({
      type: 'app',
    });

    core.info('==> User Installation ID Getting ');
    let authentication = await request('GET /users/{username}/installation', {
      username: codeOwner,
      request: {
        hook: auth.hook,
        headers: {
          authentication: `token ${auth_app_token.token}`,
        },
      },
    });

    core.info('Get User Installation ID.');

    const auth_token = await auth({
      type: 'installation',
      installationId: authentication.data.id,
    });

    const user_info = await request(`GET /user`, {
      request: {
        hook: auth.hook,
        headers: {
          authentication: `token ${auth_token}`,
        },
      },
    });

    core.setSecret(auth_token.token);
    //core.setOutput("token", auth_token.token)
    console.log(user_info);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
