function encrypt(s, key) {
  var r = new Random(key);
  var string = s;
  var ints = []
  var solution = "";
  for (var i = 0; i < string.length; i++) {
    ints.push(string.charCodeAt(i));
    for (var j = 0; j < 6; j++) {
      ints[i]+=r.randomInt(6)-3;
    }
    solution += String.fromCharCode(ints[i]);
  }
  return solution;
}

function decrypt(s, key) {
  var r = new Random(key);
  var string = s;
  var ints = []
  var solution = "";
  for (var i = 0; i < string.length; i++) {
    ints.push(string.charCodeAt(i));
    for (var j = 0; j < 6; j++) {
      ints[i]-=r.randomInt(6)-3;
    }
    solution += String.fromCharCode(ints[i]);
  }
  return solution;
}

function Random(k) {
  this.seed = k;

  this.randomInt = function (range) {
    return Math.round(this.random()*range)
  }

  this.randomFloat = function (range) {
    return this.random()*range;
  }

  this.random = function () {
    var x = Math.sin(this.seed++) * 12439;
    return x - Math.floor(x);
  }
}
