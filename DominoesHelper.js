class DominoesHelper {
    static montarMesa(mesas) {
        const pile = [];
        for (let s = 0; s < 7; s++) {
            for (let f = 0; f <= s; f++) {
                pile.push([f, s]);
            }
        }
        console.log("Tiles populated.", pile);
        for (let i = pile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pile[i], pile[j]] = [pile[j], pile[i]];
        }
        console.log("Tiles Shuffled.", pile);

        console.log("Tiles are dealt between four players.");
        let i = 0;
        while (i < 28) {
            mesas.users[0].hand.push(pile[i]);
            mesas.users[1].hand.push(pile[i + 1]);
            mesas.users[2].hand.push(pile[i + 2]);
            mesas.users[3].hand.push(pile[i + 3]);
            i += 4;
        }
        pile.splice(0, 28);
        console.log("Player1 ->", mesas.users[0]);
        console.log("Player2 ->", mesas.users[1]);
        console.log("Player3 ->", mesas.users[2]);
        console.log("Player4 ->", mesas.users[3]);
        return mesas;
    }
    static montarMesa2(mesas) {

        mesas.played = [
            [0, 4],
            [4, 5],
            [5, 5],
            [5, 0],
            [0, 0],
            [0, 3],
            [3, 6],
            [6, 4],
            [4, 1],
            [1, 1],
            [1, 6],
            [6, 6],
            [6, 5],
            [5, 1],
            [1, 0],
            [0, 6],
            [6, 2]
        ];

        mesas.users[0].hand = [
            [2, 3]
        ];
        mesas.users[0].status = 0;
        mesas.users[1].hand = [
            [2, 4],
            [1, 2],
            [0, 2]
        ];
        mesas.users[1].status = 1;
        mesas.users[2].hand = [
            [3, 5],
            [2, 5]
        ];
        mesas.users[2].status = 0;
        mesas.users[3].hand = [
            [4, 4],
            [3, 3],
            [1, 3],
            [3, 4],
            [2, 2]
        ];
        mesas.users[3].status = 0;


        return mesas;
    }

    static contarJogo(hand) {
        var result = [0, 0, 0, 0, 0, 0, 0];
        for (let s = 0; s < hand.length; s++) {
            result[hand[s][0]]++;
            if (hand[s][0] != hand[s][1])
                result[hand[s][1]]++;
        }
        return result;
    }
    static removeJogador(mesas, idUser) {
        console.log('mezas', mesas);
        if (mesas.length > 0) {
            console.log('uzres', mesas[0].users);
            console.log('idUser', idUser);
            var index = mesas[0].users.map(function(item) { return item.id; }).indexOf(idUser);
            console.log('indexUser', index);
            if (index != -1) {
                mesas[0].users[index].id = '';
            }
            console.log('uzres2', mesas[0].users);
        }
        return mesas;
    }
    static hideOtherPieces(mesasHiding, idUser, idMesa) {
        // console.log('Hiding pieces to ' + idUser)
        for (let j = 0; j < mesasHiding[idMesa].users.length; j++) {
            // console.log(mesas[idMesa].users[j].id + " != " + idUser)
            if (mesasHiding[idMesa].users[j].id != idUser && idUser != '') {
                // console.log('mask piece from ' + mesasHiding[idMesa].users[j].id);
                for (let i = 0; i < mesasHiding[idMesa].users[j].hand.length; i++) {
                    mesasHiding[idMesa].users[j].hand[i][0] = 'X';
                    mesasHiding[idMesa].users[j].hand[i][1] = 'X';
                }
            }
        }
        return mesasHiding;
    }
    static removePieces(mesas) {
        for (let j = 0; j < mesas.length; j++) {
            for (let k = 0; k < mesas[j].users.length; k++) {
                mesas[j].users[k].hand = []
            }
        }
        return mesas;
    }
    static getNome(jogadores, id) {
        var idPlayer = jogadores.map(function(item) { return item.id; }).indexOf(id);
        if (idPlayer == -1) return '';
        return jogadores[idPlayer].name;
    }
    static atualizaPlacar(mesas, index, jogadores) {
        // console.log('mesas', mesas);
        if (index == -1) return mesas;
        mesas[index].placar[0].users = [];
        mesas[index].placar[1].users = [];
        // console.log('players', mesas[index].players);
        for (let s = 0; s < mesas[index].players && s < mesas[index].users.length; s++) {
            if ((s % 2) == 0) {
                mesas[index].placar[0].users.push({ name: mesas[index].users[s].tipo == 'CPU' ? 'CPU' : DominoesHelper.getNome(jogadores, mesas[index].users[s].id), id: mesas[index].users[s].tipo == 'CPU' ? 'CPU' : mesas[index].users[s].id });
            } else {
                mesas[index].placar[1].users.push({ name: mesas[index].users[s].tipo == 'CPU' ? 'CPU' : DominoesHelper.getNome(jogadores, mesas[index].users[s].id), id: mesas[index].users[s].tipo == 'CPU' ? 'CPU' : mesas[index].users[s].id });
            }
        }
        return mesas;
    }

    static pieceOk(pieces, piece, pos) {
        var returno = [false, false];
        var contaJogo = DominoesHelper.contarJogo(pieces);
        // console.log(pieces, piece);

        if (pieces.length == 0) return [true, true];

        if (pos == 0 && pieces[0][0] == piece[0]) {
            // console.log('if2', (pieces[0].includes(piece[0]) + "||" + pieces[0].includes(piece[1])));
            // console.log('1', (pieces[0]));
            // console.log('2', (piece));
            if (contaJogo[piece[1]] == 6 && contaJogo[piece[0]] < 6)
                return [false, false];
            return [true, false];
        }

        if (pos == 0 && pieces[0][0] == piece[1]) {
            // console.log('if2', (pieces[0].includes(piece[0]) + "||" + pieces[0].includes(piece[1])));
            // console.log('1', (pieces[0]));
            // console.log('2', (piece));
            if (contaJogo[piece[0]] == 6 && contaJogo[piece[1]] < 6)
                return [false, false];
            return [true, true];
        }
        if (pos == pieces.length && pieces.length > 1 && pieces[pieces.length - 1][1] == piece[0]) {
            // console.log('if3', (pieces[pieces.length - 1].includes(piece[pieces.length - 1]) + "||" + pieces[0].includes(piece[1])));
            // console.log('1', (pieces[pieces.length - 1]));
            // console.log('2', (piece));
            if (contaJogo[piece[1]] == 6 && contaJogo[piece[0]] < 6)
                return [false, false];
            returno = [true, true];
        }
        if (pos == pieces.length && pieces.length > 1 && pieces[pieces.length - 1][1] == piece[1]) {
            // console.log('if3', (pieces[pieces.length - 1].includes(piece[pieces.length - 1]) + "||" + pieces[0].includes(piece[1])));
            // console.log('1', (pieces[pieces.length - 1]));
            // console.log('2', (piece));
            if (contaJogo[piece[0]] == 6 && contaJogo[piece[1]] < 6)
                return [false, false];
            returno = [true, false];
        }
        return returno;
    }
    static isExists(pieces, hand) {

        var returno = false;
        var pieceOK = false;
        if (pieces.length == 0) return true;
        for (let i = 0; i < hand.length; i++) {
            // console.log('passei', hand[i]);
            // console.log('pieces', pieces);
            var pieceExist = DominoesHelper.pieceOk(pieces, hand[i], 0);
            var pieceExist2 = DominoesHelper.pieceOk(pieces, hand[i], pieces.length);

            if (pieceExist[0]) {
                returno = true;
                break;
            }
            if (pieceExist2[0]) {
                returno = true;
                break;
            }
        }

        return returno;
    }

}

module.exports = DominoesHelper;