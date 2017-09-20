var socket = io('http://jantschulev.ddns.net:3003');
// var socket = io('10.173.232.222:3003');

var send_button = document.getElementById('send_button');
var input = document.getElementById('message_input');
var main = document.getElementById('main');
var colorNames = ['orange', 'purple', 'green', 'red', 'blue', 'yellow'];
var colors = ['rgb(255, 180, 30)', 'rgb(170, 0, 255)', 'rgb(0, 240, 0)', 'rgb(255, 0, 0)', 'rgb(0, 120, 255)', 'rgb(255, 220, 0)'];
var text_commands = ['!help', '!colour', '!change colour ', '!change name ', '!clear ', '!krypton ', '!info'];
var command_index = 0;
var showInfo = false;
var input_value;
var name = Cookies.get('name');
if (name == "undefined") {
  name = prompt("What is you name?");
  Cookies.set('name', name);
}

var chat_color = Cookies.get('chat_color');
if (chat_color == undefined) {
  chat_color = Math.floor(Math.random() * colors.length);
}
document.body.style.setProperty('--accent', colors[chat_color]);


socket.on('new_connected', function (m_array) {
  for (var i = m_array.length - 1; i >= 0; i--) {
    if (m_array[i].n == name) {
      createMessage(true, m_array[i]);
    } else {
      createMessage(false, m_array[i]);
    }
  }
})
socket.on('new_message', function (m) {
  if (m.n == name) {
    createMessage(true, m);
  } else {
    createMessage(false, m);
  }
});
socket.on('clear', function () {
  console.log("clear recieved");
  main.innerHTML = '';
});

function send() {
  var message = input.value;
  input.value = "";
  if (!message.replace(/\s/g, '').length) { return }

  if (message.charAt(0) == "!") {
    commands(message);
    return;
  }

  var message_object = {
    m: message,
    n: name,
    t: timeNow()
  }

  socket.emit("send", message_object);
  createMessage(true, message_object);
}

function commands(message) {
  var m = message;
  if (m.charAt(1) == " ") {
    m = m.substr(2);
  } else {
    m = m.substr(1);
  }
  if (m.indexOf("change colour") == 0) {
    var c = m.substr(14);
    for (var i = 0; i < colorNames.length; i++) {
      if (c == colorNames[i]) {
        chat_color = i;
        Cookies.set("chat_color", chat_color);
        document.body.style.setProperty('--accent', colors[chat_color]);
        return;
      }
    }
  }
  if (m.indexOf("colour") == 0) {
    chat_color = Math.floor(Math.random() * colors.length);
    document.body.style.setProperty('--accent', colors[chat_color]);
  }
  if (m.indexOf("info") == 0) {
    if (showInfo) {
      showInfo = false;
      var infos = document.getElementsByClassName('message_info_container');
      for (var i = 0; i < infos.length; i++) {
        infos[i].style.display = "none";
      }
    } else {
      showInfo = true;
      var infos = document.getElementsByClassName('message_info_container');
      for (var i = 0; i < infos.length; i++) {
        infos[i].style.display = "block";
      }
    }
  }
  if (m.indexOf("change name") == 0) {
    var newName = m.substr(12);
    name = newName;
    Cookies.set("name", name);
    window.location.reload();
  }
  if (m.indexOf("clear") == 0) {
    var p = m.substr(6);
    socket.emit('clear', p);
  }
  if (m.indexOf("help") == 0) {
    var delay = 2500;
    var time_out = 800;
    sendSupport("The Kraken is here to help!", time_out);
    sendSupport("Click on a message to reveal who sent it and when.", time_out += delay);
    sendSupport("type '! change colour [color]' to change theme.", time_out += delay);
    sendSupport("You can choose from 6 colours: red, green, blue, orange, yellow and purple", time_out += delay);
    sendSupport("enter '!change name [newName]' to change you name", time_out += delay);
    sendSupport("type '!clear [password]' to clear the chat", time_out += delay);
    sendSupport("You can always see this by entering '!help'", time_out += delay);
  }
  if (m.indexOf("krypton ") == 0) {
    user_text = m.substr(8);
    var kryptonKey = user_text.slice(user_text.indexOf("key=") + 4, user_text.indexOf(";"));
    user_message = user_text.substr(user_text.indexOf(";") + 2);
    if (user_text.includes("-d")) {
      var data = {
        m: decrypt(user_message, kryptonKey),
        n: 'krypton',
        t: timeNow()
      }
      createMessage(false, data)
    } else {
      user_send_message(encrypt(user_message, kryptonKey));
    }
  }
}

function createMessage(colored, message_object) {
  var container = document.createElement("DIV");
  container.className = 'message_container';
  var info_container = document.createElement("DIV");
  info_container.className = 'message_container message_info_container';

  var info = document.createElement("DIV");
  info.appendChild(document.createTextNode(message_object.n + " @ " + message_object.t));

  var div = document.createElement("DIV");
  if (colored) {
    div.className = 'user_message message';
    info.className = "user_message_info message_info";
  } else {
    div.className = 'foreign_message message';
    info.className = "foreign_message_info message_info";
  }
  var t = document.createTextNode(message_object.m);
  div.appendChild(t);


  container.appendChild(div);
  info_container.appendChild(info);
  main.appendChild(container);
  main.appendChild(info_container);

  main.scrollTop = main.scrollHeight;
}

function scrollDown() {
  main.scrollTop = main.scrollHeight;
}

main.addEventListener('scroll', function () {
  if (main.scrollTop < main.scrollHeight - main.clientHeight * 1.8) {
    document.getElementById('down_arrow').style.display = 'block';
  } else {
    document.getElementById('down_arrow').style.display = 'none';
  }
})

input.addEventListener('keydown', function () {
  if (event.which == 13) {
    send();
  }
  if (event.which == 38) {
    for (var i = 0; i < text_commands.length; i++) {
      if (text_commands[i] == input.value) {
        input.value = '';
        return;
      }
    }

  }
  if (event.which == 40) {
    input_value = input.value;
    input.value = text_commands[command_index];
    command_index--;
    if (command_index <= -1) {
      command_index = text_commands.length - 1;
    }
  }
})

function sendSupport(supportMessage, time_out) {
  setTimeout(function () {
    var message_object = {
      m: supportMessage,
      n: "kraken",
      t: timeNow()
    }
    socket.emit("send", message_object);
    createMessage(false, message_object);
  }, time_out);
}
function user_send_message(message) {
  var message_object = {
    m: message,
    n: name,
    t: timeNow()
  }
  socket.emit("send", message_object);
  createMessage(true, message_object);
}

function timeNow() {
  var d = new Date(),
    h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
    m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  return h + ':' + m;
}
