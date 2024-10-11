let editor;
let currentFile = null;
const fileSystem = {
    name: 'root',
    type: 'folder',
    children: []
};

function initializeEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
        theme: "monokai",
        mode: "javascript",
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: true,
        lineWrapping: true
    });

    editor.on("change", () => {
        if (currentFile) {
            currentFile.content = editor.getValue();
            saveToLocalStorage();
        }
    });

    loadFromLocalStorage();
    updateFileTree();
}

function createNewFile() {
    const fileName = prompt("Enter file name:");
    if (fileName) {
        const file = {
            name: fileName,
            type: 'file',
            content: "",
            language: document.getElementById("languageSelect").value
        };
        fileSystem.children.push(file);
        updateFileTree();
        selectFile(file);
        saveToLocalStorage();
    }
}

function createNewFolder() {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
        const folder = {
            name: folderName,
            type: 'folder',
            children: []
        };
        fileSystem.children.push(folder);
        updateFileTree();
        saveToLocalStorage();
    }
}

function updateFileTree() {
    const fileTree = document.getElementById("fileTree");
    fileTree.innerHTML = "";
    renderFileTree(fileSystem, fileTree);
}

function renderFileTree(item, parentElement) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.name}</span>`;
    li.classList.add(item.type);

    if (item.type === 'folder') {
        const ul = document.createElement("ul");
        ul.classList.add("folder-contents");
        item.children.forEach(child => renderFileTree(child, ul));
        li.appendChild(ul);
        li.querySelector('span').addEventListener('click', () => {
            ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        li.addEventListener('click', () => selectFile(item));
    }

    parentElement.appendChild(li);
}

function selectFile(file) {
    currentFile = file;
    editor.setValue(file.content);
    editor.setOption("mode", file.language);
    document.getElementById("languageSelect").value = file.language;
}

function saveToLocalStorage() {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
}

function loadFromLocalStorage() {
    const savedFileSystem = localStorage.getItem('fileSystem');
    if (savedFileSystem) {
        Object.assign(fileSystem, JSON.parse(savedFileSystem));
    }
}

function changeLanguage() {
    const language = document.getElementById("languageSelect").value;
    editor.setOption("mode", language);
    if (currentFile) {
        currentFile.language = language;
        saveToLocalStorage();
    }
}

function setupConsole() {
    const consoleInput = document.getElementById("console-input");
    const consoleOutput = document.getElementById("console-output");

    consoleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const code = consoleInput.value;
            consoleInput.value = "";

            try {
                const result = eval(code);
                consoleOutput.innerHTML += `<div>> ${code}</div><div class="result">${result}</div>`;
            } catch (error) {
                consoleOutput.innerHTML += `<div>> ${code}</div><div class="error">${error}</div>`;
            }

            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    document.getElementById("newFileBtn").addEventListener("click", createNewFile);
    document.getElementById("newFolderBtn").addEventListener("click", createNewFolder);
    document.getElementById("saveBtn").addEventListener("click", saveToLocalStorage);
    document.getElementById("languageSelect").addEventListener("change", changeLanguage);
    setupConsole();
});
