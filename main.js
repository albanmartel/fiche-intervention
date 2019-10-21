const electron = require("electron")
const {dialog} = require('electron')
const fs = require('fs')

const interpretationClass = require("./intervention/app")
const EventEmitter = require('events').EventEmitter
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const electapp = electron.app
const creationFenetreEvent = new EventEmitter()
const printPDFEvent = new EventEmitter()
const createPDFWindowsEvent = new EventEmitter()
const recapitulationEvent = new EventEmitter()
const afficherPDFEvent = new EventEmitter()
const enregistrerPDFEvent = new EventEmitter()
const createSavePDFEvent = new EventEmitter()

/*
 * Module dependencies
 */
const express = require('express'),
  stylus = require('stylus'),
  nib = require('nib'),
  http = require('http'),
  https = require('https'),
  hbs = require('hbs')

const {
  exec
} = require('child_process')

//const noErrorSpawn = spawn(npm, ['install'])
const request = require('request')

const fenetreNavigateur = electron.BrowserWindow

//const bodyParser = require('body-parser')
const open = require('open')
const expressApp = express()

const csrf = require('csrf')
const session = require('cookie-session')
/* On utilise les sessions */

const dateFormat = require('dateformat')
const bodyParser = require('body-parser')
const os = require('os')

//const URL = require('url').Url
const {
  URL
} = require('url')
const url = require('url')
const path = require('path')

var pdfCreateWindow
var mainWindow
var pdfVueWindow
var urlLocal = "http://localhost:3578/"
let eventObject = {
  "url": urlLocal,
  "chargementEvent": creationFenetreEvent,
  "pdfEvent": printPDFEvent,
  "recapEvent": recapitulationEvent,
  "savePDFEvent":  enregistrerPDFEvent
}
var interpretationInstance = new interpretationClass.interventionServer(eventObject)

//const {BrowserWindow} = require('electron')

function createMainWindow(){
  mainWindow = new BrowserWindow({
    show: false,
    backgroundColor: '#2e2c29',
    webPreferences: {
      plugins: true
    },
    autohideMenuBar: false,
    width: 800,
    height: 1024,
    icon: __dirname + '/Icones/engrenages.ico'
  })

  mainWindow.on("closed", function() {
    pdfCreateWindow = null
    pdfVueWindow = null
    mainWindow = null
    console.log("fenêtres fermées")
  })
}

creationFenetreEvent.on('success', function(uri){
  console.log("creationFenetreEvent activé")
  mainWindow.removeMenu()
  mainWindow.setTitle("Logiciel de Création de Fiche d'Intervention")
  /* Les 2 chargements successifs pour corriger bug linux */
  mainWindow.loadURL("http://0.0.0.0")
  mainWindow.loadURL(uri)
  mainWindow.show()
})

function createPDFWindows(callback){
  pdfCreateWindow = new BrowserWindow({
    show: false,
    parent: mainWindow
  })
  pdfCreateWindow.setTitle("fenêtre de création pdf")
  pdfCreateWindow.on("closed", function() {
    //pdfCreateWindow = null
    console.log("fenêtre de création pdf fermée")
  })

  pdfVueWindow = new BrowserWindow({
    parent: mainWindow,
    webPreferences: {
      plugins: true
    },
    autohideMenuBar: false,
    width: 800,
    height: 1024,
    show: false
  })

  pdfVueWindow.setTitle("Fenêtre de vue du pdf généré")
  pdfVueWindow.on("closed", function() {
    pdfVueWindow = null
    console.log("Fenêtre de vue du pdf fermée")
  })
  callback()
}

recapitulationEvent.on('success', function(uri) {
  mainWindow.loadURL(uri)
})

printPDFEvent.on('success', function(uri, fichierTemp) {
    createPDFWindows(function(){
      createPDFWindowsEvent.emit('success', uri, fichierTemp)
    })
})

createPDFWindowsEvent.on('success', function(uri, fichierTemp){
  console.log('Création du fichier pdf : ' + fichierTemp + ' à partir de la vue : ' + uri)
  //pdfCreateWindow.setTitle("Fiche d'Intervention")
  pdfCreateWindow.loadURL(uri)
  pdfCreateWindow.webContents.on('did-finish-load', () => {
    pdfCreateWindow.webContents.printToPDF({
      marginsType: 4,
      pageSize: "A4",
      landscape: false,
      printBackground: true
    }, (error, data) => {
      if (error) throw error
        fs.writeFile(fichierTemp, data, (error) => {
          //getTitle of Window
          console.log(pdfCreateWindow.webContents.getTitle())
          //Silent Print
          if (error) throw error
          console.log('Write PDF successfully.')
          afficherPDFEvent.emit('success', fichierTemp)
        })

    })
  })
})

afficherPDFEvent.on('success', function(fichierTemp) {
  pdfCreateWindow.emit("closed")
  pdfVueWindow.loadURL('file://' + fichierTemp)
  pdfVueWindow.show()
})

enregistrerPDFEvent.on('success', function(uri, titreFichier){
  if (pdfVueWindow != null){
    pdfVueWindow.emit("closed")
  }
  if (pdfCreateWindow != null){
    pdfCreateWindow.emit("closed")
  }
  createPDFWindows(function(){
    createSavePDFEvent.emit('success', uri, titreFichier)
  })
})

createSavePDFEvent.on('success', function(uri, titreFichier){
  console.log("createSavePDFEvent active")
  let options = {
    "title": "Enregistrer Fiche Intervention",
    "type": "pdf",
    "defaultPath": "~/" + titreFichier
  }
  pdfCreateWindow.setTitle("Logiciel de Création de Fiche d'Intervention")
  pdfCreateWindow.loadURL(uri)
  pdfCreateWindow.webContents.on('did-finish-load', function(){
    let printOptions = {
      marginsType: 4,
      pageSize: "A4",
      landscape: false,
      printBackground: true
    }
    pdfCreateWindow.webContents.printToPDF(printOptions, function(error, data){
      if (error){
        console.log("Erreur : " + error)
      }
      let options = {
        "title": "Enregistrer Fiche Intervention",
        "type": "pdf",
        "defaultPath": "~/" + titreFichier
      }
      dialog.showSaveDialog(options, function (fichierTemp, error){
        if(typeof fichierTemp === 'string' || fichierTemp instanceof String){
          fs.writeFile(fichierTemp, data, function(error){
            if (error) throw error
            console.log('Fichier PDF '+ fichierTemp +' enregistrer avec succès.')
            pdfCreateWindow.emit('close')
          })
        } else {
          console.log("Erreur : fichierTemp n'est de type string")
        }
      })
    })
  })
})

app.on("ready", createMainWindow )
app.on("error", function(error) {
  console.log("Erreur : " + erro)
})
app.on("browser-window-created", function(e, window) {
  window.setMenu(null)
})

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", function() {
  if (mainWindow === null) {
    createMainWindow()
  }
})
