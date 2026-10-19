const serverless = require('serverless-http');
const { createApiApp } = require('../../dist/main.js');

let handlerPromise;
async function initialize() {
  process.env.NODE_ENV = 'production';
  const app = await createApiApp();
  try {
    await app.init();
    return serverless(app.getHttpAdapter().getInstance());
  } catch (error) {
    await app.close();
    throw error;
  }
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  handlerPromise ||= initialize().catch(error => { handlerPromise = undefined; throw error; });
  try {
    const handler = await handlerPromise;
    const path = event.path.replace(/^\/\.netlify\/functions\/api(?=\/|$)/, '/api');
    return await handler({ ...event, path }, context);
  } catch (error) {
    const message = String(error?.message || '');
    const category = /SSL|TLS|certificate/i.test(message) ? 'TLS' : /auth/i.test(message) ? 'AUTH' : /server selection|connect|timed out/i.test(message) ? 'CONNECTION' : 'INITIALIZATION';
    const servers = error?.reason?.servers;
    const causes = servers instanceof Map ? [...servers.values()].map(server => ({ name: server.error?.name, code: server.error?.code, causeCode: server.error?.cause?.code, tls: /SSL|TLS|certificate/i.test(String(server.error?.message || '')) })) : [];
    console.error('API request failed', { name: error?.name, category, causes });
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' }) };
  }
};
