template GreaterThan() {
    signal input a;
    signal input b;
    signal output out;

    component lt = LessThan(252);
    lt.in[0] <== b;
    lt.in[1] <== a;
    out <== lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1-n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * (1 << i);
    }

    lc1 === in;
}

component main = GreaterThan();