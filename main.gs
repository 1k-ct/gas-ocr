// Compiled using household 1.0.0 (TypeScript 4.5.5)
var exports = exports || {};
var module = module || { exports: exports };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import "google-apps-script";
let prop = PropertiesService.getScriptProperties();
let CURRENT_DIR = prop.getProperty("CURRENT_DIR") ?? "";
// 読み込むフォルダ
// このフォルダにある写真（png, jpg）が読み込まれ光学式文字認識（OCR）される
let IMG_DIR = prop.getProperty("IMG_DIR") ?? "";
// OCRされたテキストファイルを保存するフォルダ
// .txt拡張子で保存される
let TEXT_DIR = prop.getProperty("TEXT_DIR") ?? "";
// 処理済みフォルダ
let Done_IMG_DIR = prop.getProperty("Done_IMG_DIR") ?? "";
function main() {
    let files = readFiles(IMG_DIR);
    while (files.hasNext()) {
        let imgFile = files.next();
        let docFile = generateDocFilesByImage(imgFile) ?? null;
        if (docFile == null) {
            console.log("none");
        }
        docFile = docFile;
        generateTextFileByDoc(docFile);
        let docID = docFile.id ?? "";
        if (docID == "") {
            console.log("id is none");
            return;
        }
        addDoneFileAndRemoveImage(imgFile);
        Drive.Files?.remove(docID);
    }
}
function parseText() {
    let folder = DriveApp.getFolderById(TEXT_DIR);
    let files = folder.getFiles();
    let texts = [];
    while (files.hasNext()) {
        let file = files.next();
        let text = file.getBlob().getDataAsString();
        texts = text.split("\n");
    }
    let products = [];
    let prices = [];
    for (let i = 0; i < texts.length; i++) {
        if (i % 2 == 0) {
            products.push(texts[i]);
        }
        else {
            prices.push(texts[i]);
        }
    }
    console.log(products);
    console.log(prices);
}
function readFiles(folderID) {
    let folder = DriveApp.getFolderById(folderID);
    let files = folder.getFiles();
    return files;
}
function generateDocFilesByImage(imageFile) {
    let requestBody = {
        title: imageFile.getName().split(".")[0],
        parents: [{ id: CURRENT_DIR }],
    };
    let newFile = Drive.Files?.insert(requestBody, imageFile, { ocr: true }) ?? null;
    return newFile;
}
function generateTextFileByDoc(docFile) {
    let docFileID = docFile.id ?? "";
    if (docFileID == "") {
        console.log("ファイルIDが無効または存在しません");
    }
    let textDir = DriveApp.getFolderById(TEXT_DIR);
    let doc = DocumentApp.openById(docFileID);
    let docText = doc.getBody().getText();
    let fileName = doc.getName() + ".txt";
    textDir.createFile(fileName, docText);
    doc.saveAndClose();
}
function addDoneFileAndRemoveImage(imgFile) {
    // 処理したimgファイルを処理済みフォルダに移動し
    // 処理したimgファイルは削除する
    let imgFolder = DriveApp.getFolderById(Done_IMG_DIR);
    imgFolder.addFile(DriveApp.getFileById(imgFile.getId()));
    DriveApp.getFolderById(IMG_DIR).removeFile(DriveApp.getFileById(imgFile.getId()));
}
