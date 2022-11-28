const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const dominoesHelper = require("./DominoesHelper");

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
var jogadores = [];
var mesas = [{
        name: '4 Jogadores',
        regra: 1,
        users: [],
        status: 0,
        played: [],
        players: 4,
        placar: [
            { users: [], pontos: 3 },
            { users: [], pontos: 3 }
        ],
        piecesHand: 7
    },
    {
        name: '2 Jogadores e 2 CPUs',
        regra: 1,
        users: [
            { id: '', pos: 0, hand: [], status: 0, tipo: 'CPU' },
            { id: '', pos: 1, hand: [], status: 0, tipo: 'CPU' }
        ],
        status: 0,
        played: [],
        players: 4,
        placar: [
            { users: [], pontos: 0 },
            { users: [], pontos: 0 }
        ],
        piecesHand: 7
    },
    {
        name: '2 Jogadores, 14 pedras',
        regra: 1,
        users: [
            { id: '', pos: 0, hand: [], status: 0, tipo: 'CPU' }
        ],
        status: 0,
        played: [],
        players: 2,
        placar: [
            { users: [], pontos: 0 },
            { users: [], pontos: 0 }
        ],
        piecesHand: 14
    },
    {
        name: '1 Jogador e 1 CPU, 14 pedras',
        regra: 1,
        users: [
            { id: '', pos: 0, hand: [], status: 0, tipo: 'CPU' }
        ],
        status: 0,
        played: [],
        players: 2,
        placar: [
            { users: [], pontos: 0 },
            { users: [], pontos: 0 }
        ],
        piecesHand: 14
    }
];
var index = 0;


io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);
    index++;
    jogadores.push({ name: 'Anonimo ' + index, id: socket.id, hand: [] });
    io.emit('chat message', jogadores[jogadores.length - 1].name + ' entrou', 'Sistema');

    socket.on('disconnect', () => {
        var index = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);
        var indexMesa = -1;
        io.emit('chat message', jogadores[index].name + ' saiu.', 'Sistema');
        jogadores = jogadores.filter(function(item) { return item.id !== socket.id });
        mesas = dominoesHelper.removeJogador(mesas, socket.id);
        for (let i = 0; i < mesas.length; i++) {
            if (mesas[i].users.map(function(item) { return item.id; }).indexOf(socket.id) > -1) {
                idMesa = i;
                break;
            }
        }
        mesas = dominoesHelper.atualizaPlacar(mesas, indexMesa, jogadores);
        io.emit('mesas', mesas, jogadores);

    });
    socket.on('chat message', (msg) => {
        var index = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);
        // io.emit('chat message', msg, jogadores[index].name, socket.id);
        io.to(socket.id).emit('chat message', msg, jogadores[index].name, socket.id);
    });
    socket.on('join', (pos, idMesa) => {
        var index = mesas[idMesa].users.map(function(item) { return item.id; }).indexOf(socket.id);
        var idPlayer = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);
        let ativos = 0;
        for (let i = 0; i < mesas[idMesa].users.length; i++) {
            if (mesas[idMesa].users[i].tipo == 'CPU') ativos++;
            if (mesas[idMesa].users[i].tipo == 'HUMAN' && mesas[idMesa].users[i].id != '') ativos++;
        }
        if (index < 0) {
            if (ativos == mesas[idMesa].players) return false;
            if (mesas[idMesa].users.length < 4 && mesas[idMesa].status == 0) {
                io.emit('chat message', jogadores[idPlayer].name + ' sentou na mesa ' + mesas[idMesa].name, 'Sistema');
                mesas[idMesa].users.push({ id: socket.id, pos: pos, hand: [], status: 0, tipo: 'HUMAN' });
            } else {
                for (let i = 0; i < mesas[idMesa].users.length; i++) {
                    if (mesas[idMesa].users[i].id == "") {
                        mesas[idMesa].users[i].id = socket.id;
                        break;
                    }
                }
            }
        } else {
            mesas[idMesa].users[index].id = '';
            io.emit('chat message', jogadores[idPlayer].name + ' saiu da mesa', 'Sistema');
        }
        if (mesas[idMesa].users.length == 4 && mesas[idMesa].status == 0) {
            mesas[idMesa].status = ativos == mesas[idMesa].players ? 1 : 0;
        }
        if (mesas[idMesa].status == 1) {
            mesas[idMesa].status = 2;
            mesas[idMesa] = dominoesHelper.montarMesa2(mesas[idMesa]);

            //Definir quem inicia
            for (let i = 0; i < mesas[idMesa].users.length; i++) {
                for (let j = 0; j < mesas[idMesa].users[i].hand.length; j++) {
                    if (mesas[idMesa].users[i].hand[j][0] == 6 && mesas[idMesa].users[i].hand[j][1] == 6) { mesas[idMesa].users[i].status = 1 }
                }
            }
            io.emit('jogadores', jogadores);
        }
        mesas = dominoesHelper.atualizaPlacar(mesas, idMesa, jogadores);
        // io.emit('mesas', mesas, jogadores);
        for (let j = 0; j < mesas.length; j++) {
            for (let k = 0; k < mesas[j].users.length; k++) {
                var mesasHiding = JSON.parse(JSON.stringify(mesas));
                if (mesas[j].users[k].id != '') {
                    dominoesHelper.hideOtherPieces(mesasHiding, mesasHiding[j].users[k].id, j);
                    io.to(mesas[j].users[k].id).emit('mesas', mesasHiding, jogadores);
                }
            }
        }
    });
    socket.on('apelido', (id, nome) => {
        var index = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);
        io.emit('chat message', jogadores[index].name + ' alterou o nome para ' + nome, 'Sistema');
        jogadores[index].name = nome;
        var idMesa = -1;
        for (let i = 0; i < mesas.length; i++) {
            if (mesas[i].users.map(function(item) { return item.id; }).indexOf(socket.id) > -1) {
                idMesa = i;
                break;
            }
        }
        mesas = dominoesHelper.atualizaPlacar(mesas, idMesa, jogadores);
        io.emit('jogadores', jogadores);
        // io.emit('mesas', mesas, jogadores);
        // io.emit('mesas', dominoesHelper.removePieces(mesas), jogadores);
        for (let j = 0; j < mesas.length; j++) {
            for (let k = 0; k < mesas[j].users.length; k++) {
                var mesasHiding = JSON.parse(JSON.stringify(mesas));
                if (mesas[j].users[k].id != '') {
                    dominoesHelper.hideOtherPieces(mesasHiding, mesasHiding[j].users[k].id, j);
                    io.to(mesas[j].users[k].id).emit('mesas', mesasHiding, jogadores);
                }
            }
        }
    });
    socket.on('novaMesa2', (nome) => {
        mesas.push({ name: nome, regra: 1, users: [], status: 0, played: [] });
        io.emit('mesas', mesas);
        console.log(mesas);
    });
    socket.on('play', (index, pos, idMesa) => {
        if (mesas[idMesa].status == 0) return;
        var idxUserMesa = mesas[idMesa].users.map(function(item) { return item.id; }).indexOf(socket.id);
        var index2 = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);
        var pieceOk = dominoesHelper.pieceOk(mesas[idMesa].played, mesas[idMesa].users[idxUserMesa].hand[index], pos);
        var isExists = dominoesHelper.isExists(mesas[idMesa].played, mesas[idMesa].users[idxUserMesa].hand);
        if (mesas[idMesa].users[idxUserMesa].status == 1 && pieceOk[0]) {
            var piece = pieceOk[1] ? mesas[idMesa].users[idxUserMesa].hand[index] : [mesas[idMesa].users[idxUserMesa].hand[index][1], mesas[idMesa].users[idxUserMesa].hand[index][0]];
            pos == 0 ? mesas[idMesa].played.unshift(piece) : mesas[idMesa].played.push(piece);
            mesas[idMesa].users[idxUserMesa].hand.splice(index, 1);
            mesas[idMesa].users[idxUserMesa].status = 0;
            var prxIdx = idxUserMesa;
            idxUserMesa == 3 ? prxIdx = 0 : prxIdx++;
            mesas[idMesa].users[prxIdx].status = 1;
            // io.emit('mesas', mesas, jogadores);
            for (let j = 0; j < mesas.length; j++) {
                for (let k = 0; k < mesas[j].users.length; k++) {
                    var mesasHiding = JSON.parse(JSON.stringify(mesas));
                    if (mesas[j].users[k].id != '') {
                        dominoesHelper.hideOtherPieces(mesasHiding, mesasHiding[j].users[k].id, j);
                        io.to(mesas[j].users[k].id).emit('mesas', mesasHiding, jogadores);
                    }
                }
            }
        } else {
            if (isExists) {

                console.log('Jogada invalida');
            } else {
                mesas[idMesa].users[idxUserMesa].status = 0;
                var prxIdx = idxUserMesa;
                idxUserMesa == 3 ? prxIdx = 0 : prxIdx++;
                mesas[idMesa].users[prxIdx].status = 1;
                io.emit('chat message', jogadores[index2].name + ' passou', 'Sistema');
                // io.emit('mesas', mesas, jogadores);
                for (let j = 0; j < mesas.length; j++) {
                    for (let k = 0; k < mesas[j].users.length; k++) {
                        var mesasHiding = JSON.parse(JSON.stringify(mesas));
                        if (mesas[j].users[k].id != '') {
                            dominoesHelper.hideOtherPieces(mesasHiding, mesasHiding[j].users[k].id, j);
                            io.to(mesas[j].users[k].id).emit('mesas', mesasHiding, jogadores);
                        }
                    }
                }
            }
        }
        if (mesas[idMesa].users[idxUserMesa].hand.length == 0) {
            // zerar as maos
            for (let i = 0; i < mesas[idMesa].users.length; i++) {
                mesas[idMesa].users[i].hand = [];
                mesas[idMesa].users[i].id == socket.id ? mesas[idMesa].users[i].status = 1 : mesas[idMesa].users[i].status = 0;
            }
            // Atualizar placar vencedor
            for (let i = 0; i < mesas[idMesa].placar.length; i++) {
                for (let j = 0; j < mesas[idMesa].placar[i].users.length; j++) {
                    if (mesas[idMesa].placar[i].users[j].id == socket.id) mesas[idMesa].placar[i].pontos++;
                }
                if (mesas[idMesa].placar[i].pontos == 4) {
                    console.log(true);
                    for (let k = 0; k < mesas[idMesa].placar.length; k++) {
                        mesas[idMesa].placar[k].pontos = 0;
                        mesas[idMesa].placar[k].users = [];
                    }
                    mesas[idMesa].users = [];
                    mesas[idMesa].status = 0;
                    break;
                }
            }
            mesas[idMesa].played = [];
            if (mesas[idMesa].status != 0) mesas[idMesa] = dominoesHelper.montarMesa(mesas[idMesa]);

            io.emit('chat message', jogadores[index2].name + ' Venceu a partida', 'Sistema');
            // io.emit('mesas', mesas, jogadores);
            for (let j = 0; j < mesas.length; j++) {
                for (let k = 0; k < mesas[j].users.length; k++) {
                    var mesasHiding = JSON.parse(JSON.stringify(mesas));
                    if (mesas[j].users[k].id != '') {
                        dominoesHelper.hideOtherPieces(mesasHiding, mesasHiding[j].users[k].id, j);
                        io.to(mesas[j].users[k].id).emit('mesas', mesasHiding, jogadores);
                    }
                }
            }
        }
    });
    io.emit('jogadores', jogadores);
    io.emit('mesas', mesas, jogadores);

    // console.log(jogadores);
    // io.sockets.socket(socketId).emit(msg);

});



server.listen(3000, () => {
    console.log('listening on *:3000');
});