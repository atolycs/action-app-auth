const core = require('@actions/core');
const { Octokit, App } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

async function run() {
  try {
    const appID = core.getInput('appID', { required: true });
    const privateKey = core.getInput('privateKey', { required: true });

    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appID,
        privateKey: privateKey,
      },
    });

    //appOctokit.getInstallationOctokit()

    const { data } = await appOctokit.request('/app');
    //const { data } = await appOctokit.request('/user')
    const { token } = await appOctokit.auth({
                type: "app"
            })

    const bot_infomation = await appOctokit.request('GET /user')
    console.log(data);
    console.log(token)
    console.log(bot_infomation)
  } catch (error) {
    core.setFailed(error);
  }
}

run();
