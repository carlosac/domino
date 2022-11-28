var socket = io();

var messages = document.getElementById('messages');
var listaMesa = document.getElementById('mesas');
var form = document.getElementById('form1');
var form2 = document.getElementById('form2');
var msgTextForm = document.getElementById('msgTextForm');
var input = document.getElementById('input');
var input2 = document.getElementById('input2');
var send = document.getElementById('send');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('apelido', socket.id, input.value);
        input.value = '';
    }
});
msgTextForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var msgText = document.getElementById('msgText');
    if (msgText.value) {
        socket.emit('chat message', msgText.value);
        msgText.value = '';
    }
});
form2.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input2.value) {
        socket.emit('novaMesa', input2.value);
        input2.value = '';
    }
});


socket.on('chat message', function(msg, name, id) {
    var item = document.createElement('li');
    // item.textContent = msg;

    if (name == 'Sistema') {
        var text = msg;
    } else {
        var classe = id == socket.id ? 'message-sent' : 'message-received';
        var text = "<div class='" + classe + "'>" +
            "<div class='bubble'>" + msg +
            "</div><br>" +
            "         <div class='timestamp'>" + name + "</div> </div>";
    }
    item.innerHTML = text;

    messages.appendChild(item);
    // window.scrollTo(0, document.body.scrollHeight);
    // window.scrollTo(0, document.querySelector(".conversation-wrapper").scrollHeight);
    const theElement = document.getElementById('conversation-wrapper');

    const scrollToBottom = (node) => {
        node.scrollTop = node.scrollHeight;
    }

    scrollToBottom(theElement);
});
socket.on('jogadores', function(jogadores) {
    // console.log(jogadores);
    var index = jogadores.map(function(item) { return item.id; }).indexOf(socket.id);

    var bemvindo = document.getElementById('bemvindo');
    bemvindo.innerHTML = 'Bem vindo ' + jogadores[index].name;

    var myList = document.getElementById('jogadores');

    myList.innerHTML = '';
    // for (let i = 1; i < jogadores.length + 1; i++) {
    //   console.log(i + ' ' + jogadores[i - 1].name);
    //   var item = document.createElement('li');
    //   item.textContent = 'Jogador ' + i + ': ' + jogadores[i - 1].name;
    //   myList.appendChild(item);
    //   window.scrollTo(0, document.body.scrollHeight);
    // }

    // if (jogadores.length >= 4) {
    //   var node = document.getElementById("formulario");
    //   if (node.parentNode) {
    //     node.parentNode.removeChild(node);
    //   }
    // }
});
socket.on('mesas', function(mesas, jogadors) {
    console.log('mesas', mesas);
    organizeMesa(mesas, jogadors);
    var idMesa = -1;
    for (let i = 0; i < mesas.length; i++) {
        idMesa = mesas[i].users.map(function(item) { return item.id; }).indexOf(socket.id) > -1 ? i : -1;
        if (idMesa > -1) break;
    }
    if (idMesa > -1) {
        var index = mesas[idMesa].users.map(function(item) { return item.id; }).indexOf(socket.id);
        if (index > -1 && mesas[idMesa].played.length > 0 && mesas[idMesa].users[index].hand.length > 0 && mesas[idMesa].status > 0) {
            if (mesas[idMesa].users[index].status == 1) {
                var isExist = isExists(mesas[idMesa].played, mesas[idMesa].users[index].hand);
                if (!isExist) {
                    socket.emit('play', 0, 0, idMesa);
                }
            }
        }
    }
});
socket.on('jogador1', function(jogador1) {
    console.log(jogador1);

    var myList = document.getElementById('jogador1');

});

function organizeMesa(mesas, jogadors) {
    var handsTable = document.getElementById('jogadores');
    handsTable.className = 'linha';
    handsTable.innerHTML = '';
    var idMesa = -1;

    for (let i = 0; i < mesas.length; i++) {
        var idxMesa = mesas[i].users.map(function(item) { return item.id; }).indexOf(socket.id);
        if (idxMesa > -1) {
            idMesa = i;
            break;
        }
    }

    // console.log('Organize MEsas', mesas);
    if (idMesa > -1) {
        //criar divs para cada jogador pelo id jogador

        // console.log('idMesa', idMesa)
        // console.log('mesaDiv' + idMesa, mesas[idMesa].users)
        for (let i = 0; i < mesas[idMesa].users.length; i++) {
            var divPlacar = document.createElement('div');
            var idDiv = mesas[idMesa].users[i].id == '' ? 'CPU' + i : mesas[idMesa].users[i].id;
            // console.log("idnOVA dIV", idDiv);
            divPlacar.setAttribute("id", idDiv);
            handsTable.appendChild(divPlacar);
        }

        var textPlayed = "<p>" + mesas[idMesa].name + "</p>";

        for (let i = 0; i < mesas[idMesa].users.length; i++) {
            // console.log('jogador', mesas[idMesa].users[i]);
            var idDiv = mesas[idMesa].users[i].id == '' ? 'CPU' + i : mesas[idMesa].users[i].id;
            var jogador = document.getElementById(idDiv);
            var idxPlayer = jogadors.map(function(item) { return item.id; }).indexOf(mesas[idMesa].users[i].id);
            // console.log('div', idxPlayer);
            var nome = idxPlayer == -1 ? 'Aguardando jogador' : jogadors[idxPlayer].name;
            jogador.innerHTML = "<p>" + nome + "</p>";
            if (mesas[0].users[i].status == 1) {
                jogador.style.fontWeight = "bold";
                jogador.className = 'pieceOrigem';
            } else {
                jogador.style.fontWeight = "normal";
                jogador.className = '';
            }
            if (mesas[idMesa].users[i].hand.length > 0) {
                prencherDominoes(jogador, mesas[idMesa].users[i].hand, mesas[idMesa].users[i].id == socket.id ? 'itsme' : '');
            }
        }



        var placar = document.getElementById('placar');
        var tabelaPlacar = mesas[idMesa].placar.length > 0 ? "<table border= '1' cellpadding = 0  cellspacing = 0><caption>Placar</caption>" : "";
        var tr = ['', ''];
        //     <table border="0" cellspacing=0 cellpadding="2" style="padding: 10px;">
        //     <caption>Placar</caption>
        //     <tr>
        //         <td>January</td>
        //         <td rowspan="2">0</td>
        //         <td rowspan="2">X</td>
        //         <td rowspan="2">2</td>
        //         <td>January2</td>
        //     </tr>
        //     <tr>
        //         <td>February</td>
        //         <td>February2</td>
        //     </tr>
        // </table>
        // <ul id="placar"></ul>
        // <ul id="jogadores"></ul>

        for (let i = 0; i < mesas[idMesa].placar.length; i++) {
            tr[0] += i == 0 ? "<tr>" : "";
            tr[1] += i == 0 ? "<tr>" : "";

            // var divPlacar = document.createElement('div');
            // var idDiv = 'placar' + i;
            // divPlacar.setAttribute("id", idDiv);
            // divPlacar.className = 'linha';
            // placar.appendChild(divPlacar);
            // var divUser = document.createElement('div');
            // divUser.className = 'coluna';
            // divPlacar.appendChild(divUser);
            // tabelaPlacar += "<tr>";
            if (i == 1) {
                tr[0] += " <td rowspan='2'>" + mesas[idMesa].placar[i - 1].pontos + "</td>";
                tr[0] += " <td rowspan='2'>X</td>";
                tr[0] += " <td rowspan='2'>" + mesas[idMesa].placar[i].pontos + "</td>";
            }
            // console.log('mesa', mesas[idMesa])
            for (let j = 0; j < mesas[idMesa].placar[i].users.length; j++) {
                // var novaDiv2 = document.createElement('div');
                // divUser.appendChild(novaDiv2);
                // let txt = mesas[idMesa].placar[i].users[j].name + '</br>';
                // novaDiv2.innerHTML += mesas[idMesa].placar[i].users[j].name + '</br>';
                tr[j] += "<td>" + mesas[idMesa].placar[i].users[j].name + "</td>";

            }
            // var divResult = document.createElement('div');
            // divResult.className = 'coluna';
            // placar.appendChild(divResult);
            // divResult.innerHTML = mesas[idMesa].placar[i].pontos;
        }
        tr[0] += tr[0] == '' ? '' : '</tr>';
        tr[1] += tr[1] == '' ? '' : '</tr></table>';
        // console.log('td, ', tr);
        tabelaPlacar += tr[0] + tr[1];
        placar.innerHTML = tabelaPlacar;

        var played = document.getElementById('played');
        played.innerHTML = textPlayed;
        if (mesas[idMesa].users.length == 4) {
            prencherDominoes(played, mesas[idMesa].played, 'itsmesa');
        }
        document.querySelectorAll('.itsme').forEach(item => {
            item.addEventListener('click', event => {
                document.querySelectorAll('.itsme').forEach(item2 => {
                    item2.className.includes("sided") ? item2.className = 'domino sided itsme' : item2.className = 'domino itsme';
                });
                // console.log('Clicou', item.className);
                item.className += " pieceOrigem";
                if (mesas[0].played.length == 0) {
                    socket.emit('play', item.id, 0, idMesa);
                }
            })
        });
        var ultimo;
        document.querySelectorAll('.itsmesa').forEach((item, index) => {
            if (index == 0) {
                item.addEventListener('mouseenter', event => {
                    document.querySelectorAll('.itsmesa').forEach(item2 => {
                        // item2.className = 'domino itsmesa';
                        item2.className.includes("sided") ? item2.className = 'domino sided itsmesa' : item2.className = 'domino itsmesa';
                    });
                    item.className.includes("sided") ? item.className = 'domino sided itsmesa pieceOrigem' : item.className = 'domino itsmesa pieceOrigem';
                    // item.className = "domino itsmesa pieceOrigem";
                });
                item.addEventListener('mouseleave', event => {
                    document.querySelectorAll('.itsmesa').forEach(item2 => {
                        // item2.className = 'domino itsmesa';
                        item2.className.includes("sided") ? item2.className = 'domino sided itsmesa' : item2.className = 'domino itsmesa';
                    });
                });
                item.addEventListener('click', event => {
                    document.querySelectorAll('.itsme').forEach(item2 => {
                        if (item2.className.includes("pieceOrigem")) {
                            socket.emit('play', item2.id, 0, idMesa);
                        }
                    });
                });
            } else {
                ultimo = item;
            }
        });
        if (typeof ultimo !== 'undefined') {
            ultimo.addEventListener('mouseenter', event => {
                document.querySelectorAll('.itsmesa').forEach(item2 => {
                    // item2.className = 'domino itsmesa';
                    item2.className.includes("sided") ? item2.className = 'domino sided itsmesa' : item2.className = 'domino itsmesa';
                });
                ultimo.className.includes("sided") ? ultimo.className = 'domino sided itsmesa pieceOrigem' : ultimo.className = 'domino itsmesa pieceOrigem';
                // ultimo.className = "domino itsmesa pieceOrigem";
            });
            ultimo.addEventListener('mouseleave', event => {
                document.querySelectorAll('.itsmesa').forEach(item2 => {
                    // item2.className = 'domino itsmesa';
                    item2.className.includes("sided") ? item2.className = 'domino sided itsmesa' : item2.className = 'domino itsmesa';
                });
            });
            ultimo.addEventListener('click', event => {
                document.querySelectorAll('.itsme').forEach(item2 => {
                    if (item2.className.includes("pieceOrigem")) {
                        socket.emit('play', item2.id, mesas[0].played.length, idMesa);
                    }
                });
            });
        }

        // elementsArray.addEventListener('click', function(e) {
        //     e.preventDefault();

        //     console.log('Clicou', e);
        // });

    } else {
        document.getElementById('played').innerHTML = '';
        document.getElementById('placar').innerHTML = '';
    }

    // var myList = document.getElementById('mesas');

    listaMesa.innerHTML = '';
    var tabelaMesas = '';
    if (mesas.length > 0) {
        tabelaMesas += '<table border=0>';
    }

    for (let i = 1; i < mesas.length + 1; i++) {
        var qtd = mesas[i - 1].users.length;
        var item = document.createElement('li');
        var index = -1;
        // console.log('meeeeeeeeeeeesa', mesas[i - 1]);
        if (mesas[i - 1].users.length > 0) {
            index = mesas[i - 1].users.map(function(item) { return item.id; }).indexOf(socket.id);
        }

        var action = index >= 0 ? 'Sair' : 'Jogar';
        var idJogar = 'jogar' + i;
        tabelaMesas += '<tr>';
        tabelaMesas += '<td>' + mesas[i - 1].name + "</td><td><input type='button' value='" + action + "' id='" + idJogar + "'" + "/></td>";
        tabelaMesas += '</tr>';
        if (i == mesas.length) tabelaMesas += '</table>';
        // item.textContent = mesas[i - 1].name + ', Jogadores: ' + qtd;
        // listaMesa.appendChild(item);
        // var jogar = document.getElementById(idJogar);
        // jogar.addEventListener('click', function(e) {
        //     e.preventDefault();

        //     socket.emit('join', 0, socket.id);

        // });
    }
    listaMesa.innerHTML = tabelaMesas;
    for (let i = 1; i < mesas.length + 1; i++) {
        var idJogar = 'jogar' + i;
        var jogar = document.getElementById(idJogar);
        jogar.addEventListener('click', function(e) {
            e.preventDefault();

            socket.emit('join', 0, i - 1);

        });
    }

    function getNumber(num) {
        var text = '';
        switch (num) {
            case 0:
                text = "zero";
                break;
            case 1:
                text = "one";
                break;
            case 2:
                text = "two";
                break;
            case 3:
                text = "three";
                break;
            case 4:
                text = "four";
                break;
            case 5:
                text = "five";
                break;
            case 6:
                text = "six";
                break;
            default:
                console.log('ERROR!!!! ' + num);
                text = "zero";
        }
        return text;
    }
    const buttonPressed = e => {
        console.log(e.target.id); // Get ID of Clicked Element
    }

    function prencherDominoes(div, hand, className) {

        if (hand.length > 0) {
            var classLine = hand[0][0] == "X" ? "line-branca" : "line";
            var domino = "";
            for (let i = 0; i < hand.length; i++) {
                var classMesa = '';
                if (className == 'itsmesa' && hand[i][0] != hand[i][1]) {
                    classMesa = 'sided ';
                }

                domino = "        <div class='domino " + classMesa + className + "' id='" + i + "'>               " +
                    "          <div class='upper " + getNumber(hand[i][0]) + "'>" +
                    "            <div class='dots'>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "            </div>" +
                    "          </div>" +
                    "          <div class='" + classLine + "'></div>" +
                    "          <div class='lower " + getNumber(hand[i][1]) + "'>" +
                    "            <div class='dots'>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "              <div class='row'>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "                <div class='dot'></div>" +
                    "              </div>" +
                    "            </div>" +
                    "          </div>" +
                    "        </div>";
                div.innerHTML += domino;
            }

            // console.log('hand', hand);
        }
    }
}

function pieceOk(pieces, piece, pos) {
    var returno = [false, false];
    if (pieces.length == 0) return [true, true];

    if (pos == 0 && pieces[0][0] == piece[0]) {
        // console.log('if2', (pieces[0].includes(piece[0]) + "||" + pieces[0].includes(piece[1])));
        // console.log('1', (pieces[0]));
        // console.log('2', (piece));
        return [true, false];
    }

    if (pos == 0 && pieces[0][0] == piece[1]) {
        // console.log('if2', (pieces[0].includes(piece[0]) + "||" + pieces[0].includes(piece[1])));
        // console.log('1', (pieces[0]));
        // console.log('2', (piece));
        return [true, true];
    }
    if (pos == pieces.length && pieces.length > 1 && pieces[pieces.length - 1][1] == piece[0]) {
        // console.log('if3', (pieces[pieces.length - 1].includes(piece[pieces.length - 1]) + "||" + pieces[0].includes(piece[1])));
        // console.log('1', (pieces[pieces.length - 1]));
        // console.log('2', (piece));
        returno = [true, true];
    }
    if (pos == pieces.length && pieces.length > 1 && pieces[pieces.length - 1][1] == piece[1]) {
        // console.log('if3', (pieces[pieces.length - 1].includes(piece[pieces.length - 1]) + "||" + pieces[0].includes(piece[1])));
        // console.log('1', (pieces[pieces.length - 1]));
        // console.log('2', (piece));
        returno = [true, false];
    }
    return returno;
}

function isExists(pieces, hand) {

    var returno = false;
    if (pieces.length == 0) return true;
    for (let i = 0; i < hand.length; i++) {
        var pieceExist = pieceOk(pieces, hand[i], 0);
        var pieceExist2 = pieceOk(pieces, hand[i], pieces.length);

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