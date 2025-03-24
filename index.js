const { sha256 } = require('js-sha256');

const fetchLatestBlock = () => 
     fetch('https://blockchain.info/q/latesthash?cors=true')
       .then(response => response.text())


const fetchMerkleRootAndTransactions = block => 
    fetch(`https://blockchain.info/rawblock/${block}?cors=true`)
        .then(response => response.json())
        .then(data => [data.mrkl_root, data.tx.map(tx => tx.hash)])

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


 

fetchLatestBlock()
    .then(fetchMerkleRootAndTransactions)
    .then(([root, txs]) => {
       
        console.log(merkleRoot(txs))
        console.log(root)
    }
)

// console.log(sha256('hello world'))