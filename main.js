function ij2coord(i, j) {
  return "abcdefgh"[j] + (8 - i);
}
function coord2ij(coord) {
  return [8 - parseInt(coord[1]), "abcdefgh".split("").indexOf(coord[0])];
}
function makepiece(piece, color) {
  let elem = document.createElement("img");
  elem.className = "piece";
  elem.src = `images/Chess_${piece}${color}t60.png`;
  elem.alt = `${piece}${color}`;
  elem.draggable = true;
  elem.ondragstart = function(e) {
    elem.style.transform = "scale(1.3);";
    e.dataTransfer.setData("piece", piece);
    e.dataTransfer.setData("color", color);
    e.dataTransfer.setData("from", elem.parentElement.id);
  };
  return elem;
}
function drawBoard() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let div = document.createElement("div");
      div.style.backgroundColor =
        (i + (j % 2)) % 2 ? "var(--black)" : "var(--white)";
      div.id = ij2coord(i, j);
      div.ondrop = function(e) {
        e.preventDefault();
        let piece = e.dataTransfer.getData("piece");
        let color = e.dataTransfer.getData("color");
        let from = e.dataTransfer.getData("from");
        makemove(from, this.id);
      };
      div.ondragover = function(e) {
        e.preventDefault();
      };
      board.appendChild(div);
      cells[i][j] = div;
    }
  }
}
function clearBoard() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let p = cells[i][j].querySelector(".piece");
      if (p != null) {
        cells[i][j].removeChild(p);
      }
    }
  }
}
function redraw() {
  clearBoard();
  let board = chess.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let b = board[i][j];
      if (board[i][j] != null) {
        cells[i][j].appendChild(makepiece(b.type, b.color));
      }
    }
  }
}
function checkStatus() {
  let stat = document.querySelector(".status");
  let hist = chess.history();
  let lastplayer = chess.turn() == "b" ? "White" : "Black";
  let nextplayer = chess.turn() == "w" ? "White" : "Black";

  let status = nextplayer + " to move";

  let audio = document.querySelector(".click");
  if (chess.in_checkmate()) {
    audio = document.querySelector(".gameover");
    status = "Checkmate";
  } else if (chess.in_check()) {
    audio = document.querySelector(".woua");
    status = nextplayer + " is check";
  } else if (chess.in_draw()) {
    audio = document.querySelector(".gameover");
    status = "Draw";
  } else if (chess.in_stalemate()) {
    audio = document.querySelector(".gameover");
    status = "Stalemate";
  } else if (hist[hist.length - 1].indexOf("x") != -1) {
    //a piece is taken
    audio = document.querySelector(".clouch");
  }
  stat.value = status;
  audio.volume = 0.1;
  audio.play();
}
function reset() {
  chess.reset();
  redraw();
}
function undo() {
  chess.undo();
  redraw();
}
function makemove(from, to) {
  let m = chess.move({ from: from, to: to });
  if (m != null) {
    // it was an ok move !
    redraw();
    window.location.hash = chess.fen().replace(/ /g, "_");
    checkStatus();
  }
  return m;
}
function loadFromhash() {
  let fen = window.location.hash.replace(/_/g, " ").replace("#", "");
  if (fen != "") {
    chess.load(fen);
  }
  redraw();
}
// ----------------------------------- PEERING --------------------
function initPeer() {
  peer.on("open", function(id) {
    console.log("My peer ID is: " + id);
    document.querySelector(".myid").value = id;
  });

  return peer;
}
function connect() {
  window.open("fb-messenger://share?link=" + window.location.href);
}
/*
  let hisid = document.querySelector(".hisid").value;
  var conn = peer.connect(hisid);
  console.log("trying to connect...");
  peer.on("connection", function(conn) {
    console.log("connected");
  });

  conn.on("open", function() {
    // Receive messages
    conn.on("data", function(data) {
      console.log("Received", data);
    });

    // Send messages
    conn.send("Hello!");
  });
}*/
// ----------------------------------- MAIN -----------------------
let chess = new Chess();

window.onhashchange = loadFromhash;

let board = document.querySelector(".chessboard");
let cells = [[], [], [], [], [], [], [], []];
drawBoard();
loadFromhash(); //if the window was loaded with some hash
redraw();
var RTCPeerConnection =
  window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
var peerConn = new RTCPeerConnection({
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
});
console.log('Call create(), or join("some offer")');
function create() {
  console.log("Creating ...");
  var dataChannel = peerConn.createDataChannel("test");
  dataChannel.onopen = e => {
    window.say = msg => {
      dataChannel.send(msg);
    };
    console.log('Say things with say("hi")');
  };
  dataChannel.onmessage = e => {
    console.log("Got message:", e.data);
  };
  peerConn
    .createOffer({})
    .then(desc => peerConn.setLocalDescription(desc))
    .then(() => {})
    .catch(err => console.error(err));
  peerConn.onicecandidate = e => {
    if (e.candidate == null) {
      console.log(
        "Get joiners to call: ",
        "join(",
        JSON.stringify(peerConn.localDescription),
        ")"
      );
    }
  };
  window.gotAnswer = answer => {
    console.log("Initializing ...");
    peerConn.setRemoteDescription(new RTCSessionDescription(answer));
  };
}

function join(offer) {
  console.log("Joining ...");

  peerConn.ondatachannel = e => {
    var dataChannel = e.channel;
    dataChannel.onopen = e => {
      window.say = msg => {
        dataChannel.send(msg);
      };
      console.log('Say things with say("hi")');
    };
    dataChannel.onmessage = e => {
      console.log("Got message:", e.data);
    };
  };

  peerConn.onicecandidate = e => {
    if (e.candidate == null) {
      console.log(
        "Get the creator to call: gotAnswer(",
        JSON.stringify(peerConn.localDescription),
        ")"
      );
    }
  };

  var offerDesc = new RTCSessionDescription(offer);
  peerConn.setRemoteDescription(offerDesc);
  peerConn
    .createAnswer({})
    .then(answerDesc => peerConn.setLocalDescription(answerDesc))
    .catch(err => console.warn("Couldn't create answer"));
}
