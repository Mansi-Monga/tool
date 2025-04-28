document.getElementById('encryption-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const inputText = document.getElementById('input-text').value;
    const algorithm = document.getElementById('algorithm').value;
    const key = document.getElementById('key').value;
    const action = document.querySelector('input[name="action"]:checked').value;

    let resultText = '';

    if (action === 'encrypt') {
        resultText = encrypt(inputText, algorithm, key);
    } else {
        resultText = decrypt(inputText, algorithm, key);
    }

    document.getElementById('result-text').innerText = resultText;
 // Show the copy button and suggestion
    const copyButton = document.getElementById('copy-button');
     const suggestion = document.getElementById('suggestion');
     copyButton.style.display = 'inline-block';
     suggestion.style.display = 'block';
 });

 // Copy to clipboard functionality
 document.getElementById('copy-button').addEventListener('click', function() {
     const resultText = document.getElementById('result-text').innerText;
     navigator.clipboard.writeText(resultText).then(() => {
         alert('Copied to clipboard!');
     }).catch(err => {
         console.error('Error copying text: ', err);
     });
 });

function encrypt(text, algorithm, key) {
    switch (algorithm) {
        case 'aes':
            return CryptoJS.AES.encrypt(text, key).toString();
        case 'des':
            return CryptoJS.DES.encrypt(text, key).toString();
        case 'caesar':
            return caesarCipher(text, key, 'encrypt');
        case 'vigenere':
            return vigenereCipher(text, key, 'encrypt');
        case 'playfair':
            return playfairCipher(text, key, 'encrypt');
        case 'xor':
            return xorCipher(text, key);
        default:
            return 'Invalid algorithm';
    }
}

function decrypt(text, algorithm, key) {
    switch (algorithm) {
        case 'aes':
            return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        case 'des':
            return CryptoJS.DES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        case 'caesar':
            return caesarCipher(text, key, 'decrypt');
        case 'vigenere':
            return vigenereCipher(text, key, 'decrypt');
        case 'playfair':
            return playfairCipher(text, key, 'decrypt');
        case 'xor':
            return xorCipher(text, key);
        default:
            return 'Invalid algorithm';
    }
}

// Caesar Cipher
function caesarCipher(text, shift, action) {
    const shiftNum = parseInt(shift) % 26;
    return text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const code = char.charCodeAt(0);
            const base = code >= 65 && code <= 90 ? 65 : 97;
            const newChar = String.fromCharCode(((code - base + (action === 'encrypt' ? shiftNum : -shiftNum) + 26) % 26) + base);
            return newChar;
        }
        return char;
    }).join('');
}

// XOR Cipher
function xorCipher(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Vigenère Cipher (Basic Implementation)
function vigenereCipher(text, key, action) {
    const keyLength = key.length;
    let result = '';
    for (let i = 0, j = 0; i < text.length; i++) {
        const char = text[i];
        if (char.match(/[a-zA-Z]/)) {
            const isUpper = char === char.toUpperCase();
            const base = isUpper ? 65 : 97;
            const shift = key[j % keyLength].toLowerCase().charCodeAt(0) - 97;
            const charCode = char.charCodeAt(0) - base;

            if (action === 'encrypt') {
                result += String.fromCharCode((charCode + shift) % 26 + base);
            } else {
                result += String.fromCharCode((charCode - shift + 26) % 26 + base);
            }
            j++;
        } else {
            result += char;
        }
    }
    return result;
}

// Playfair Cipher (Basic Implementation)
function playfairCipher(text, key, action) {
    const createMatrix = (key) => {
        const matrix = [];
        const uniqueKey = [...new Set(key.replace(/[^a-zA-Z]/g, '').toLowerCase())];
        const alphabet = 'abcdefghiklmnopqrstuvwxyz'; // 'j' is omitted
        const combined = uniqueKey.concat([...alphabet].filter(letter => !uniqueKey.includes(letter)));

        for (let i = 0; i < 5; i++) {
            matrix.push(combined.slice(i * 5, i * 5 + 5));
        }
        return matrix;
    };

    const getPosition = (char, matrix) => {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === char) return { row: i, col: j };
            }
        }
        return null;
    };

    const processText = (text) => {
        const processed = text.toLowerCase().replace(/[^a-z]/g, '').split('');
        for (let i = 0; i < processed.length - 1; i++) {
            if (processed[i] === processed[i + 1]) {
                processed.splice(i + 1, 0, 'x'); // Insert 'x' between duplicate letters
            }
        }
        if (processed.length % 2 !== 0) {
            processed.push('x'); // Append 'x' if odd length
        }
        return processed;
    };

    const matrix = createMatrix(key);
    const processedText = processText(text);
    let result = '';

    for (let i = 0; i < processedText.length; i += 2) {
        const first = processedText[i];
        const second = processedText[i + 1];
        const pos1 = getPosition(first, matrix);
        const pos2 = getPosition(second, matrix);

        if (pos1.row === pos2.row) {
            // Same row
            result += action === 'encrypt' ? matrix[pos1.row][(pos1.col + 1) % 5] : matrix[pos1.row][(pos1.col + 4) % 5];
        } else if (pos1.col === pos2.col) {
            // Same column
            result += action === 'encrypt' ? matrix[(pos1.row + 1) % 5][pos1.col] : matrix[(pos1.row + 4) % 5][pos1.col];
        } else {
            // Rectangle swap
            result += matrix[pos1.row][pos2.col] + matrix[pos2.row][pos1.col];
        }
    }
    return result;
}