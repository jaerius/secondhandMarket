class WitnessCalculator {
  constructor(instance, sanityCheck) {
    this.instance = instance;
    this.sanityCheck = sanityCheck;

    this.version = this.instance.exports.getVersion();
    this.n32 = this.instance.exports.getFieldNumLen32();

    this.instance.exports.getRawPrime();
    const arr = new Array(this.n32);
    for (let i = 0; i < this.n32; i++) {
      arr[this.n32 - 1 - i] = this.instance.exports.readSharedRWMemory(i);
    }
    this.prime = fromArray32(arr);

    this.witnessSize = this.instance.exports.getWitnessSize();
  }

  async calculateWTNSBin(input, sanityCheck) {
    const buff32 = new Uint32Array(this.n32);
    const buff = new ArrayBuffer(buff32.byteLength);
    const h = {
      set: (offset, value) => {
        if (offset < 0 || offset >= this.n32) throw new Error('Invalid offset');
        buff32[offset] = value;
      },
    };

    const keys = Object.keys(input);
    console.log('Input keys:', keys);
    keys.forEach((k) => {
      const v = BigInt(input[k]);
      const bits = v
        .toString(2)
        .padStart(this.n32 * 32, '0')
        .split('')
        .reverse();
      for (let i = 0; i < this.n32; i++) {
        let word = 0;
        for (let j = 0; j < 32; j++) {
          word += (bits[i * 32 + j] === '1' ? 1 : 0) << j;
        }
        h.set(i, word);
      }

      const inputSize = this.instance.exports.setInputSignal(k, buff);
      console.log(`Set input signal ${k} with size ${inputSize}`);
    });

    console.log('Initializing witness calculation...');
    await this.instance.exports.init(this.sanityCheck || sanityCheck || false);
    console.log('Witness calculation initialized');

    const w = [];
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      const arr = new Uint32Array(this.n32);
      for (let j = 0; j < this.n32; j++) {
        arr[this.n32 - 1 - j] = this.instance.exports.readSharedRWMemory(j);
      }
      w.push(fromArray32(arr));
    }

    return w;
  }
}

function fromArray32(arr) {
  var res = BigInt(0);
  const n = 4;
  for (let i = 0; i < arr.length; i++) {
    res += BigInt(arr[i]) << BigInt(32 * i);
  }
  return res;
}

window.witnessCalculatorBuilder = async function (code, options = {}) {
  let wasmModule;
  try {
    wasmModule = await WebAssembly.compile(code);
  } catch (err) {
    console.log(err);
    console.log(
      '\nTry to run circom --c in order to generate c++ code instead\n',
    );
    throw new Error(err);
  }

  let wc;

  const instance = await WebAssembly.instantiate(wasmModule, {
    runtime: {
      exceptionHandler: function (code) {
        let errStr;
        if (code == 1) {
          errStr = 'Signal not found.\n';
        } else if (code == 2) {
          errStr = 'Too many signals set.\n';
        } else if (code == 3) {
          errStr = 'Signal already set.\n';
        } else if (code == 4) {
          errStr = 'Assert Failed.\n';
        } else if (code == 5) {
          errStr = 'Not enough memory.\n';
        } else {
          errStr = 'Unknown error.\n';
        }
        throw new Error(errStr);
      },
      printErrorMessage: function () {
        const errStr = getMessage();
        console.error(errStr);
      },
      writeBufferMessage: function () {
        const msg = getMessage();
        console.log(msg);
      },
      showSharedRWMemory: function () {
        printSharedRWMemory();
      },
    },
  });

  const sanityCheck = options.sanityCheck || false;
  wc = new WitnessCalculator(instance, sanityCheck);
  return wc;

  function getMessage() {
    var message = '';
    var c = instance.exports.getMessageChar();
    while (c != 0) {
      message += String.fromCharCode(c);
      c = instance.exports.getMessageChar();
    }
    return message;
  }

  function printSharedRWMemory() {
    const shared_rw_memory_size = instance.exports.getFieldNumLen32();
    const arr = new Uint32Array(shared_rw_memory_size);
    for (let j = 0; j < shared_rw_memory_size; j++) {
      arr[shared_rw_memory_size - 1 - j] =
        instance.exports.readSharedRWMemory(j);
    }
    console.log(fromArray32(arr).toString());
  }
};
