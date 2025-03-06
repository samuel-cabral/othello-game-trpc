import fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { router } from 'trpc-api';

const server = fastify({
  maxParamLength: 5000,
});

// Registrar plugins
server.register(cors, {
  origin: true, // Permitir todas as origens em desenvolvimento
});

// Registrar tRPC
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router },
});

// Rota de saúde
server.get('/health', async () => {
  return { status: 'ok' };
});

// Iniciar servidor
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 