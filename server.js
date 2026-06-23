const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

 
// Configuração da API de SMS (Twilio) - Substitua com suas credenciais após criar a conta
const accountSid = 'USf347566150704729fb04df47151ef0bd'; 
const authToken = '6P37M6XTPFP5B8NG6BR7WM1L';   
const twilioNumero = '+5561992518130'; // Seu número virtual Twilio
// Descomente quando instalar o pacote

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Memória temporária para guardar as apostas
let apostas = [];

// Rota para a página do participante
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para a página do Admin (Protegida por Login Simples)
app.post('/api/admin/login', (req, res) => {
    const { usuario, senha } = req.body;
    // Defina seu usuário e senha aqui
    if (usuario === 'admin' && senha === 'senha123') {
        res.json({ authentication: true });
    } else {
        res.status(401).json({ authentication: false, message: 'Usuário ou senha incorretos' });
    }
});

// Conexão do Socket.io para tempo real
io.on('connection', (socket) => {
    console.log('Um usuário conectou ao sistema.');

    // Envia as apostas já existentes para quem acabou de entrar (seja admin ou usuário)
    socket.emit('historicoApostas', apostas);

    // Recebe a nova aposta do participante
    socket.on('novaAposta', (dadosAposta) => {
        // dadosAposta contém: { nome, telefone, valor, palpiteTimeA, palpiteTimeB }
        apostas.push(dadosAposta);

        // Atualiza a tela de todo mundo (especialmente do admin) em tempo real
        io.emit('atualizarApostas', apostas);

        // Função para disparar o SMS de Confirmação
        enviarSmsConfirmacao(dadosAposta);
    });
});

// Função interna para enviar o SMS
function enviarSmsConfirmacao(aposta) {
    const mensagem = `Ola ${aposta.nome}! Seu palpite para o jogo (${aposta.palpiteTimeA}x${aposta.palpiteTimeB}) com aposta de R$ ${aposta.valor},00 foi registrado com sucesso. Boa sorte!`;
    
    console.log(`[SMS SIMULADO para ${aposta.telefone}]: ${mensagem}`);

    /* 
    // Para funcionar de verdade no celular, rode 'npm install twilio' no terminal e descomente este bloco:
    twilio.messages.create({
        body: mensagem,
        from: twilioNumero,
        to: aposta.telefone // Formato internacional: +55DDD9XXXXXXXX
    })
    .then(message => console.log('SMS enviado com sucesso:', message.sid))
    .catch(err => console.error('Erro ao enviar SMS:', err));
    */
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});