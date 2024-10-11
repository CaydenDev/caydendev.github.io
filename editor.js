let editor;
let currentFile = null;
const files = [];

function initializeEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
        theme: "dracula",
        mode: "javascript"
    });

    editor.on("change", () => {
        if (currentFile) {
            currentFile.content = editor.getValue();
        }
    });
}

function createNewFile() {
    const fileName = prompt("Enter file name:");
    if (fileName) {
        const file = {
            name: fileName,
            content: "",
            language: document.getElementById("languageSelect").value
        };
        files.push(file);
        updateFileList();
        selectFile(file);
    }
}

function updateFileList() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";
    files.forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.name;
        li.onclick = () => selectFile(file);
        fileList.appendChild(li);
    });
}

function selectFile(file) {
    currentFile = file;
    editor.setValue(file.content);
    editor.setOption("mode", file.language);
    document.getElementById("languageSelect").value = file.language;
}

function saveToCloud() {
    if (currentFile) {
        
        console.log(`Saving ${currentFile.name} to cloud...`);
        alert(`File ${currentFile.name} saved to cloud!`);
    } else {
        alert("No file selected!");
    }
}

function changeLanguage() {
    const language = document.getElementById("languageSelect").value;
    editor.setOption("mode", language);
    if (currentFile) {
        currentFile.language = language;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    document.getElementById("newFileBtn").addEventListener("click", createNewFile);
    document.getElementById("saveBtn").addEventListener("click", saveToCloud);
    document.getElementById("languageSelect").addEventListener("change", changeLanguage);
});
