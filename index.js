'use strict';


const secp256k1 = require('secp256k1-wasm');
const blake2b = require('blake2b-wasm');

var kobracore = module.exports;

kobracore.secp256k1 = secp256k1;

// module information
kobracore.version = 'v' + require('./package.json').version;
kobracore.versionGuard = function(version) {
	if (version !== undefined) {
		var message = 'More than one instance of kobracore-lib found. ' +
			'Please make sure to require kobracore-lib and check that submodules do' +
			' not also include their own kobracore-lib dependency.';
		throw new Error(message);
	}
};
kobracore.versionGuard(global._kobracoreLibVersion);
global._kobracoreLibVersion = kobracore.version;


const wasmModulesLoadStatus = new Map();
kobracore.wasmModulesLoadStatus = wasmModulesLoadStatus;
wasmModulesLoadStatus.set("blake2b", false);
wasmModulesLoadStatus.set("secp256k1", false);

const setWasmLoadStatus = (mod, loaded) => {
	//console.log("setWasmLoadStatus:", mod, loaded)
	wasmModulesLoadStatus.set(mod, loaded);
	let allLoaded = true;
	wasmModulesLoadStatus.forEach((loaded, mod) => {
		//console.log("wasmModulesLoadStatus:", mod, loaded)
		if (!loaded)
			allLoaded = false;
	})

	if (allLoaded)
		kobracore.ready();
}


blake2b.ready(() => {
	setWasmLoadStatus("blake2b", true);
})

secp256k1.onRuntimeInitialized = () => {
	//console.log("onRuntimeInitialized")
	setTimeout(() => {
		setWasmLoadStatus("secp256k1", true);
	}, 1);
}

secp256k1.onAbort = (error) => {
	console.log("secp256k1:onAbort:", error)
}
const deferred = ()=>{
	let methods = {};
	let promise = new Promise((resolve, reject)=>{
		methods = {resolve, reject};
	})
	Object.assign(promise, methods);
	return promise;
}
const readySignal = deferred();

kobracore.ready = ()=>{
	readySignal.resolve(true);
}
kobracore.initRuntime = ()=>{
	return readySignal;
}


// crypto
kobracore.crypto = {};
kobracore.crypto.BN = require('./lib/crypto/bn');
kobracore.crypto.ECDSA = require('./lib/crypto/ecdsa');
kobracore.crypto.Schnorr = require('./lib/crypto/schnorr');
kobracore.crypto.Hash = require('./lib/crypto/hash');
kobracore.crypto.Random = require('./lib/crypto/random');
kobracore.crypto.Point = require('./lib/crypto/point');
kobracore.crypto.Signature = require('./lib/crypto/signature');

// encoding
kobracore.encoding = {};
kobracore.encoding.Base58 = require('./lib/encoding/base58');
kobracore.encoding.Base58Check = require('./lib/encoding/base58check');
kobracore.encoding.BufferReader = require('./lib/encoding/bufferreader');
kobracore.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
kobracore.encoding.Varint = require('./lib/encoding/varint');

// utilities
kobracore.util = {};
kobracore.util.buffer = require('./lib/util/buffer');
kobracore.util.js = require('./lib/util/js');
kobracore.util.preconditions = require('./lib/util/preconditions');
kobracore.util.base32 = require('./lib/util/base32');
kobracore.util.convertBits = require('./lib/util/convertBits');
kobracore.setDebugLevel = (level)=>{
	kobracore.util.js.debugLevel = level;
}

// errors thrown by the library
kobracore.errors = require('./lib/errors');

// main bitcoin library
kobracore.Address = require('./lib/address');
kobracore.Block = require('./lib/block');
kobracore.MerkleBlock = require('./lib/block/merkleblock');
kobracore.BlockHeader = require('./lib/block/blockheader');
kobracore.HDPrivateKey = require('./lib/hdprivatekey.js');
kobracore.HDPublicKey = require('./lib/hdpublickey.js');
kobracore.Networks = require('./lib/networks');
kobracore.Opcode = require('./lib/opcode');
kobracore.PrivateKey = require('./lib/privatekey');
kobracore.PublicKey = require('./lib/publickey');
kobracore.Script = require('./lib/script');
kobracore.Transaction = require('./lib/transaction');
kobracore.URI = require('./lib/uri');
kobracore.Unit = require('./lib/unit');

// dependencies, subject to change
kobracore.deps = {};
kobracore.deps.bnjs = require('bn.js');
kobracore.deps.bs58 = require('bs58');
kobracore.deps.Buffer = Buffer;
kobracore.deps.elliptic = require('elliptic');
kobracore.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
kobracore.Transaction.sighash = require('./lib/transaction/sighash');
