const request = require('@octokit/request').request;
const core = require('@actions/core');

async function post() {
  const token = core.getState('token');

  //const expiresAt = core.getState("expiresAt")

  try {
    await request('DELETE /installation/token', {
      headers: {
        authorization: `token ${token}`,
      },
    });
    core.info(`Token Revoked`);
  } catch (error) {
    core.warning(`Token revocation failed: ${error.message}`);
  }
}

post();
