const { createHandler } = require('@app-core/server');
const executeReqline = require('../../services/reqline/execute');
module.exports = createHandler({
  path: '/',
  method: 'post',
  async handler(rc, helpers) {
    const { reqline } = rc.body;
    const result = await executeReqline({ reqline });
    return result.error
      ? { status: helpers.http_statuses.HTTP_400_BAD_REQUEST, data: result }
      : { status: helpers.http_statuses.HTTP_200_OK, data: result };
  },
});
