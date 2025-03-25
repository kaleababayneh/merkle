const { sha256 } = require('js-sha256');

const fetchLatestBlock = () => 
     fetch('https://blockchain.info/q/latesthash?cors=true')
       .then(response => response.text())


const fetchMerkleRootAndTransactions = block => 
    fetch(`https://blockchain.info/rawblock/${block}?cors=true`)
        .then(response => response.json())
        .then(data => [data.mrkl_root, data.tx.map(tx => tx.hash)])


const random = arr => arr[Math.floor(Math.random() * arr.length)]        
const toBytes = hex =>
    hex.match(/../g).reduce((acc, hex) => [...acc, parseInt(hex, 16)], [])

const toHex = bytes =>
    bytes.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')

const toPairs = arr =>
     Array.from({ length: Math.ceil(arr.length / 2) }, (_, i) => arr.slice(i * 2, i * 2 + 2))

const hashPair = (a, b = a) => {
    const bytes = toBytes(`${b}${a}`).reverse()
    const hashed = sha256.array(sha256.array(bytes))
    return toHex(hashed.reverse())
}

const merkleRoot = txs => 
    txs.length === 1 
        ? txs[0] 
        : merkleRoot(toPairs(txs).reduce((tree, pair) => [...tree, hashPair(...pair)], [])) 


const merkleProof = (txs, tx, proof = []) => {
    if (txs.length === 1) return proof

    const tree = []

    toPairs(txs).forEach(pair => {
        const hash = hashPair(...pair)

        if (pair.includes(tx)) {
            const idx = pair[0] === tx | 0
            proof.push([idx, pair[idx]])
            tx = hash
        }
        tree.push(hash)
    });

    return merkleProof(tree, tx, proof)
};
    
const merkleProofRoot = (proof, tx) => {
    return proof.reduce((root, [idx, hash]) => idx ? hashPair(root, hash) : hashPair(hash, root), tx);
}




fetchLatestBlock()
    .then(fetchMerkleRootAndTransactions)
    .then(([root, txs]) => {
        const tx = random(txs)
        const proof = merkleProof(txs, tx)
        console.log(root)
        console.log(merkleProofRoot(proof, tx))
    }
)

// console.log(sha256('hello world'))