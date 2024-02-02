const core = require('@actions/core');
const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');

async function run() {
  try {
    const appID = core.getInput('appID', { required: true });
    const privateKey = core.getInput('privateKey', { required: true });
    const codeOwner = String(process.env.GITHUB_REPOSITORY).split('/')[0];

    core.info('==> Setup Token...');

    const auth = createAppAuth({
      appId: appID,
      privateKey: privateKey,
    });

    let authentication = await request(`GET /users/${codeOwner}/installation`, {
      username: codeOwner,
      request: {
        hook: auth.hook,
      },
    });

    const auth_token = await auth({
      type: 'installation',
      installationId: authentication.data.id,
    });

    const user_info = await request(`GET /user`, {
      headers: {
        authentication: `token ${auth_token}`,
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
