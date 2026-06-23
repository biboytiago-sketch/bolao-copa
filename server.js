const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// Banco de dados temporário na memória
let apostas = [];

// Serve a página da web principal
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bolão da Copa ⚽</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 100%; margin-bottom: 20px; }
            h2, h3 { text-align: center; color: #1a237e; }
            input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
            .palpites { display: flex; gap: 10px; justify-content: space-between; }
            .palpites input { text-align: center; font-size: 18px; }
            button { width: 100%; background: #00c853; color: white; border: none; padding: 12px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; }
            button:hover { background: #00b248; }
            .admin-box { background: #ffebee; border: 2px dashed #ff1744; }
            .ganhador-card { background: #e8f5e9; border-left: 5px solid #2e7d32; padding: 10px; margin: 10px 0; border-radius: 4px; }
        </style>
    </head>
    <body>

        <div class="container">
            <h2>⚽ Fazer Meu Palpite</h2>
            <input type="text" id="nome" placeholder="Seu Nome Completo">
            <input type="text" id="telefone" placeholder="Seu Telefone (com DDD)">
            <div class="palpites">
                <input type="number" id="palpiteA" placeholder="Time A">
                <span style="align-self: center; font-weight: bold;">X</span>
                <input type="number" id="palpiteB" placeholder="Time B">
            </div>
            <button onclick="enviarAposta()">Enviar Palpite</button>
        </div>

        <div class="container admin-box">
            <h3>🔑 Painel do Admin (Resultado Real)</h3>
            <div class="palpites">
                <input type="number" id="resultadoA" placeholder="Placar A">
                <span style="align-self: center; font-weight: bold;">X</span>
                <input type="number" id="resultadoB" placeholder="Placar B">
            </div>
            <button style="background: #d50000" onclick="encerrarPartida()">Encerrar e Apurar Ganhadores</button>
        </div>

        <div class="container" id="resultado-container" style="display: none;">
            <h3>🏆 Ganhadores do Bolão 🏆</h3>
            <div id="lista-ganhadores"></div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();

            function enviarAposta() {
                const dados = {
                    nome: document.getElementById('nome').value,
                    telefone: document.getElementById('telefone').value,
                    palpiteA: parseInt(document.getElementById('palpiteA').value),
                    palpiteB: parseInt(document.getElementById('palpiteB').value)
                };

                if(!dados.nome || !dados.telefone || isNaN(dados.palpiteA) || isNaN(dados.palpiteB)) {
                    alert('Preencha todos os campos corretamente!');
                    return;
                }

                fetch('/apostar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                }).then(() => {
                    alert('Palpite registrado com sucesso! Boa sorte!');
                    document.getElementById('nome').value = '';
                    document.getElementById('telefone').value = '';
                    document.getElementById('palpiteA').value = '';
                    document.getElementById('palpiteB').value = '';
                });
            }

            function encerrarPartida() {
                const placar = {
                    resA: parseInt(document.getElementById('resultadoA').value),
                    resB: parseInt(document.getElementById('resultadoB').value)
                };

                if(isNaN(placar.resA) || isNaN(placar.resB)) {
                    alert('Insira o placar oficial!');
                    return;
                }

                socket.emit('encerrarJogo', placar);
            }

            // Escuta o evento do servidor quando os ganhadores forem calculados
            socket.on('resultadoFinal', (ganhadores) => {
                const box = document.getElementById('resultado-container');
                const lista = document.getElementById('lista-ganhadores');
                lista.innerHTML = '';
                box.style.display = 'block';

                if(ganhadores.length > 0) {
                    ganhadores.forEach(g => {
                        lista.innerHTML += \`
                            <div class="ganhador-card">
                                <strong>🥇 \${g.nome}</strong><br>
                                📱 \${g.telefone}<br>
                                🎯 Palpite: \${g.palpiteA} x \${g.palpiteB}
                            </div>
                        \`;
                    });
                } else {
                    lista.innerHTML = '<p style="text-align:center; color: red;">Ninguém acertou o placar exato.</p>';
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Rota que recebe os palpites do formulário
app.post('/apostar', (req, res) => {
    apostas.push(req.body);
    res.sendStatus(200);
});

// Monitora as ações em tempo real
io.on('connection', (socket) => {
    socket.on('encerrarJogo', (placar) => {
        // Filtra quem acertou o placar cheio
        const ganhadores = apostas.filter(a => a.palpiteA === placar.resA && a.palpiteB === placar.resB);
        
        // Dispara o resultado para todas as telas abertas no site ao mesmo tempo
        io.emit('resultadoFinal', ganhadores);
    });
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 SITE DO BOLÃO NO AR NA PORTA ${PORT}`);
});