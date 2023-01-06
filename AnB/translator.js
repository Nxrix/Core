const operate = (inp, z, i) => {
  if (inp[i] == z) {
    inp[i] = "." + z;
    if (inp[i+1]!="(") {
      inp[i+1]="("+inp[i+1]+")";
    }
  }
  return inp;
}
const translate = (inp) => {
  inp = inp.toLowerCase().replaceAll("-", "_").replaceAll("a'", "(a'm)").replaceAll("b'", "(b'm)").replaceAll("m'", "(m'm)").split("");
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