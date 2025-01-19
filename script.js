class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

const buildHuffmanTree = (frequencies) => {
    const heap = Object.entries(frequencies).map(([char, freq]) => new HuffmanNode(char, freq));
    heap.sort((a, b) => a.freq - b.freq);

    while (heap.length > 1) {
        const node1 = heap.shift();
        const node2 = heap.shift();
        const merged = new HuffmanNode(null, node1.freq + node2.freq);
        merged.left = node1;
        merged.right = node2;
        heap.push(merged);
        heap.sort((a, b) => a.freq - b.freq);
    }
    return heap[0];
};

const generateCodes = (node, currentCode = "", codes = {}) => {
    if (!node) return;
    if (node.char !== null) codes[node.char] = currentCode;
    generateCodes(node.left, currentCode + "0", codes);
    generateCodes(node.right, currentCode + "1", codes);
    return codes;
};

const compressLog = (log) => {
    const frequencies = [...log].reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
    }, {});

    const huffmanTree = buildHuffmanTree(frequencies);
    const codes = generateCodes(huffmanTree);
    const compressedLog = [...log].map((char) => codes[char]).join("");
    return { compressedLog, codes };
};

const decompressLog = (compressedLog, codes) => {
    const reversedCodes = Object.entries(codes).reduce((acc, [char, code]) => {
        acc[code] = char;
        return acc;
    }, {});

    let currentCode = "";
    let decompressedLog = "";

    for (const bit of compressedLog) {
        currentCode += bit;
        if (reversedCodes[currentCode]) {
            decompressedLog += reversedCodes[currentCode];
            currentCode = "";
        }
    }

    return decompressedLog;
};

// Função para lidar com o arrastar e soltar
const setupDragAndDrop = (section, inputElement, fileNameDisplay, button) => {
    section.addEventListener("dragover", (e) => {
        e.preventDefault();
        section.classList.add("drag-over");
    });

    section.addEventListener("dragleave", () => {
        section.classList.remove("drag-over");
    });

    section.addEventListener("drop", (e) => {
        e.preventDefault();
        section.classList.remove("drag-over");

        const file = e.dataTransfer.files[0];
        if (file) {
            inputElement.files = e.dataTransfer.files;
            fileNameDisplay.textContent = file.name;
            button.disabled = false;
        }
    });
};

// Compactação
const logFileInput = document.getElementById("logFileInput");
const fileNameDisplay = document.getElementById("fileName");
const compressBtn = document.getElementById("compressBtn");
const compressSection = document.getElementById("compressSection");

logFileInput.addEventListener("change", () => {
    if (logFileInput.files.length > 0) {
        fileNameDisplay.textContent = logFileInput.files[0].name;
        compressBtn.disabled = false;
    } else {
        fileNameDisplay.textContent = "Nenhum arquivo selecionado";
        compressBtn.disabled = true;
    }
});

setupDragAndDrop(compressSection, logFileInput, fileNameDisplay, compressBtn);

compressBtn.addEventListener("click", () => {
    if (!logFileInput.files.length) {
        status.textContent = "Por favor, selecione um arquivo de log.";
        return;
    }

    const file = logFileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const log = reader.result;
        const { compressedLog, codes } = compressLog(log);

        // Criar e baixar o arquivo compactado
        const compressedBlob = new Blob([JSON.stringify({ compressedLog, codes })], { type: "application/json" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(compressedBlob);
        downloadLink.download = "log_compressed.json";
        downloadLink.click();

        status.textContent = "Arquivo compactado gerado e baixado!";
    };

    reader.onerror = () => {
        status.textContent = "Erro ao ler o arquivo.";
    };

    reader.readAsText(file);
});