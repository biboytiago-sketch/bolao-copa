const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Lista para armazenar as apostas dos participantes
const apostas = [];

console.log("=========================================");
console.log("⚽  SISTEMA DE BOLÃO EM NODE.JS  ⚽");
console.log("=========================================\n");

// Função para cadastrar os participantes
function cadastrarParticipante() {
    console.log(`--- Cadastro do Participante #${apostas.length + 1} ---`);
    
    rl.question('Nome do participante: ', (nome) => {
        rl.question('Telefone (com DDD): ', (telefone) => {
            rl.question('Palpite de gols do Time A: ', (golsA) => {
                rl.question('Palpite de gols do Time B: ', (golsB) => {
                    
                    // Salva os dados na lista convertendo os palpites para números
                    apostas.push({
                        nome: nome,
                        telefone: telefone,
                        palpiteA: parseInt(golsA),
                        palpiteB: parseInt(golsB)
                    });

                    console.log(`\n✅ Palpite de ${nome} salvo com sucesso!\n`);
                    
                    // Pergunta se deseja adicionar mais alguém
                    rl.question('Deseja cadastrar outro participante? (S/N): ', (resposta) => {
                        if (resposta.toUpperCase() === 'S') {
                            console.log("");
                            cadastrarParticipante(); // Chama a função novamente (Loop)
                        } else {
                            console.log("\n=========================================");
                            solicitarResultadoOficial(); // Vai para a próxima etapa
                        }
                    });
                });
            });
        });
    });
}

// Função para receber o resultado real do jogo e apurar
function solicitarResultadoOficial() {
    console.log("🏁 FIM DA PARTIDA! VAMOS APURAR OS RESULTADOS");
    console.log("=========================================\n");

    rl.question('Digite o placar REAL de gols do Time A: ', (resultadoA) => {
        rl.question('Digite o placar REAL de gols do Time B: ', (resultadoB) => {
            
            const placarA = parseInt(resultadoA);
            const placarB = parseInt(resultadoB);

            console.log("\n=========================================");
            console.log(`🏆 RESULTADO OFICIAL: ${placarA} x ${placarB}`);
            console.log("=========================================\n");

            // Filtrando os ganhadores que acertaram os dois placares em cheio
            const ganhadores = apostas.filter(participante => 
                participante.palpiteA === placarA && participante.palpiteB === placarB
            );

            // Exibindo a lista de ganhadores
            if (ganhadores.length > 0) {
                console.log(`🎉 PARABÉNS AOS GANHADORES! (${ganhadores.length} acerto(s)):\n`);
                
                ganhadores.forEach((ganhador, index) => {
                    console.log(`${index + 1}º GANHADOR:`);
                    console.log(`👤 Nome: ${ganhador.nome}`);
                    console.log(`📱 Telefone: ${ganhador.telefone}`);
                    console.log(`-----------------------------------------`);
                });
            } else {
                console.log("❌ Que pena! Ninguém acertou o placar exato desta vez.");
            }

            console.log("\n⚽ Sistema encerrado. Obrigado por jogar!");
            rl.close(); // Fecha o terminal
        });
    });
}

// Inicia o programa chamando a primeira função
cadastrarParticipante();