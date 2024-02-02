const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
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

    const { data } = await appOctokit.request('/app');
    /* const { token } = await appOctokit.auth({
                type: "isntallation"
            })*/

    console.log(data);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
