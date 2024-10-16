const AetherEditor = (() => {
    let editor, currentFile;
    const fileSystem = { name: 'root', type: 'folder', children: [] };

    const initializeEditor = () => {
        editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
            lineNumbers: true,
            theme: "dracula",
            mode: "javascript",
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: true,
            lineWrapping: true,
            extraKeys: {"Ctrl-Space": "autocomplete"},
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });

        editor.on("change", () => {
            if (currentFile) {
                currentFile.content = editor.getValue();
                saveToLocalStorage(fileSystem);
            }
        });

        loadFromLocalStorage().then(() => {
            updateFileTree();
            loadFromURLParams();
        });
    };

    const createNewFile = (fileName, language) => {
        const file = {
            name: fileName,
            type: 'file',
            content: "",
            language: language || document.getElementById("languageSelect").value
        };
        fileSystem.children.push(file);
        updateFileTree();
        selectFile(file);
        saveToLocalStorage(fileSystem);
    };

    const createNewFolder = (folderName) => {
        const folder = {
            name: folderName,
            type: 'folder',
            children: []
        };
        fileSystem.children.push(folder);
        updateFileTree();
        saveToLocalStorage(fileSystem);
    };

    const deleteItem = (item, parent = fileSystem) => {
        const index = parent.children.findIndex(child => child === item);
        if (index !== -1) {
            parent.children.splice(index, 1);
            if (item === currentFile) {
                currentFile = null;
                editor.setValue("");
            }
            updateFileTree();
            saveToLocalStorage(fileSystem);
        }
    };

    const updateFileTree = () => {
        const fileTree = document.getElementById("fileTree");
        fileTree.innerHTML = "";
        renderFileTree(fileSystem, fileTree);
    };

    const renderFileTree = (item, parentElement) => {
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

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(item);
        });
        li.appendChild(deleteBtn);

        parentElement.appendChild(li);
    };

    const selectFile = (file) => {
        currentFile = file;
        editor.setValue(file.content);
        editor.setOption("mode", file.language);
        document.getElementById("languageSelect").value = file.language;
    };

    const saveToLocalStorage = (data) => {
        localStorage.setItem('fileSystem', JSON.stringify(data));
    };

    const loadFromLocalStorage = () => {
        return new Promise((resolve) => {
            const savedFileSystem = localStorage.getItem('fileSystem');
            if (savedFileSystem) {
                Object.assign(fileSystem, JSON.parse(savedFileSystem));
            }
            resolve();
        });
    };

    const changeLanguage = (language) => {
        editor.setOption("mode", language);
        if (currentFile) {
            currentFile.language = language;
            saveToLocalStorage(fileSystem);
        }
    };

    const setupConsole = () => {
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
    };

    const saveFile = () => {
        if (currentFile) {
            currentFile.content = editor.getValue();
            saveToLocalStorage(fileSystem);
            updateURLParams();
            alert("File saved successfully!");
        } else {
            alert("No file is currently selected.");
        }
    };

    const updateURLParams = () => {
        const encodedData = btoa(JSON.stringify(fileSystem));
        const newURL = `${window.location.pathname}?data=${encodedData}`;
        window.history.pushState({ path: newURL }, '', newURL);
    };

    const loadFromURLParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        if (encodedData) {
            try {
                const decodedData = JSON.parse(atob(encodedData));
                Object.assign(fileSystem, decodedData);
                updateFileTree();
                if (fileSystem.children.length > 0) {
                    selectFile(fileSystem.children[0]);
                }
            } catch (error) {
                console.error("Error loading data from URL:", error);
            }
        }
    };

    const generateShareableLink = () => {
        const currentURL = window.location.href;
        const tempInput = document.createElement("input");
        document.body.appendChild(tempInput);
        tempInput.value = currentURL;
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("Shareable link copied to clipboard!");
    };

    const init = () => {
        initializeEditor();
        document.getElementById("newFileBtn").addEventListener("click", () => {
            const fileName = prompt("Enter file name:");
            if (fileName) createNewFile(fileName);
        });
        document.getElementById("newFolderBtn").addEventListener("click", () => {
            const folderName = prompt("Enter folder name:");
            if (folderName) createNewFolder(folderName);
        });
        document.getElementById("saveBtn").addEventListener("click", saveFile);
        document.getElementById("shareBtn").addEventListener("click", generateShareableLink);
        document.getElementById("languageSelect").addEventListener("change", (e) => changeLanguage(e.target.value));
        setupConsole();
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", AetherEditor.init);