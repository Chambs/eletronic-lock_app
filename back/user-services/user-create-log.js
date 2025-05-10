const eventBus = require('./eventBus');

eventBus.on('USER_CREATED', (user) => {
  console.log('Novo usuário criado:', user);
});

