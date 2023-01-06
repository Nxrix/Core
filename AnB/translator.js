const operate = (inp, z, i) => {
  if (inp[i] == z) {
    inp[i] = "." + z;
    t = 0;
    if (inp[i + 1] != "(") {
      inp[i + 1] = "(" + inp[i + 1] + "))";
    }
    else if (inp[i + 1] == "(") {
      f = 1;
      while (inp[t] != ")") {
        t++;
      }
      if (inp[t] == "(") {
        f++;
      }
      else if (inp[t] == ")") {
        f--;
        if (f == 0) {
          inp[t] = inp[t] + ")";
        }
      }
    }
    else {
      inp[i - 1] = "(" + inp[i - 1];
    }
    if (inp[i - 1] == ")") {
      f = 1;
      while (inp[t] != "(") {
        t--;
      }
      if (inp[t] == ")") {
        f++;
      }
      else if (inp[t] == "(") {
        f--;
        if (f == 0) {
          inp[t] = "(" + inp[t];
        }
      }
    }
    else {
      inp[i - 1] = "(" + inp[i - 1];
    }
  }
  return inp;
}
const translate = (inp) => {
  inp = inp.toLowerCase().replaceAll("-", "_").replaceAll("a'", "(a')").replaceAll("b'", "(b')").replaceAll("m'", "(m')").replaceAll("'", "'m").split("");
  i = 0;
  o = "";
  for (z in inp) {
    ["n","u","_","'"].forEach(function(item){
      operate(inp,item,i);
    });
    i++;
  }
  for (z in inp) {
    o += inp[z];
  }
  return o.replaceAll("'", "p");
}

["n","u","_"].forEach(function(item){
  Object.defineProperty(String.prototype,item, {
    value: function(that) {
      return item+"(" + this + "," + that + ")";
    }
  });
});
Object.defineProperty(String.prototype, "p", {
  value: function(that) {
    return "_("+that+","+this+")";
  }
});