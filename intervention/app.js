function interventionServer(eventObject) {
  /*
   * Module dependencies
   */
  const express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    http = require('http'),
    https = require('https'),
    hbs = require('hbs')

  hbs.registerPartials(__dirname + '/views/partials')

  const {exec} = require('child_process')

  //const noErrorSpawn = spawn(npm, ['install'])
  const request = require('request')
  const electron = require("electron")
  const electapp = electron.app
  const fenetreNavigateur = electron.BrowserWindow

  const fs = require('fs')
  //const bodyParser = require('body-parser')
  const open = require('open')
  const app = express()

  const csrf = require('csrf')
  const session = require('cookie-session')
  /* On utilise les sessions */

  const dateFormat = require('dateformat')
  const bodyParser = require('body-parser')
  const EventEmitter = require('events').EventEmitter
  const creationFenetreEvent = eventObject.chargementEvent
  const printPDFEvent = eventObject.pdfEvent
  const recapitulationEvent = eventObject.recapEvent
  const enregistrerPDFEvent = eventObject.savePDFEvent
  const redirectFinalEvent = new EventEmitter()
  const os = require('os')

  //const URL = require('url').Url
  const {
    URL
  } = require('url')
  const url = require('url')
  const path = require('path')
  const chargerTypeVoie = new EventEmitter()
  const chargerTypeIntervention = new EventEmitter()
  const chargerEntreprise = new EventEmitter()
  const finishRequestEvent = new EventEmitter()

  var donneesIntervention = null

  var typesVoie = ""
  var nomsTypesVoie = ""
  var typesIntervention = ""
  var entreprise = ""
  var codeVoies = ""
  var codeTypeIntervention = ""
  var codeHorairesIntervention = ""
  var codeEntreprise = ""
  var codePostaux = ""
  var urlRequest = eventObject.url
  const urlObject = new URL(eventObject.url)
  var body = ''
  var options = ''
  var fichierTemporaire = ''
  var numeroFacture = ''
  var testGarantie = ''


  let dateDocument = dateFormat(new Date().getTime(), 'yyyy-mm-dd')

  function lireFichier(file, callback) {
    fs.readFile(file, function(err, data) {
      if (err)
        callback(err, null)
      callback(null, data)
    })
  }

  function getURL() {
    return myURL
  }

  function lireFichierCall(file, callback) {
    lireFichier(file, function(err, data) {
      let message = "lecture Fichier : " + file + " "
      if (err) {
        console.log(message + err)
      }
      console.log(message + "succès")
      callback(data)
    })
  }

  function init() {
    lireFichierCall(__dirname + '/public/conf/typesVoie.json', function(data) {
      typesVoie = JSON.parse(data.toString('utf8'))
      chargerTypeVoie.emit('success')
    })
  }

  function calculNumeroFacture(data) {
    if (data === "") {
      numeroFacture = dateFormat(new Date().getTime(), 'yyyy-mm-dd-HHMM')
    } else {
      let annee = data.replace(/\d{2}-\d{2}-(\d{4})/g, '$1')
      let mois = data.replace(/\d{2}-(\d{2})-\d{4}/g, '$1')
      let jour = data.replace(/(\d{2})-\d{2}-\d{4}/g, '$1')

      let date = new Date()
      let heures = date.getHours()
      let minutes = date.getMinutes()

      if (heures < 10) {
        heures = "0" + heures.toString()
      }
      numeroFacture = annee + "-" + mois + "-" + jour + "-" + heures + minutes

    }
    console.log("Numéro de facture : " + numeroFacture)

  }

  function htmlToPDF(uri) {
    fichierTemporaire = os.tmpdir() + "/" + donneesIntervention.prenomClient + "_" + donneesIntervention.nomClient + "_" + dateDocument + ".pdf"
    let fichierTemp = path.normalize(fichierTemporaire)
    printPDFEvent.emit('success', uri, fichierTemp, donneesIntervention.prenomClient + "_" + donneesIntervention.nomClient + "_" + dateDocument + ".pdf")
  }


  function main() {
    var server = app.listen(urlObject.port, urlObject.hostname, function() {
      console.log('Export Server fonctionne à : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port)
    })

    // catch ctrl+c event and exit normally
    process.on('SIGINT', function() {
      console.log("\nFin d'application")
      server.close()
      console.log('Ctrl-C...');
      process.exit(2);
    })

    app.set('views', __dirname + '/views')
    app.set('view engine', 'hbs')


    /* Typique de hbs */
    var blocks = {};

    hbs.registerHelper('extend', function(name, context) {
      var block = blocks[name];
      if (!block) {
        block = blocks[name] = [];
      }

      block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
    });

    hbs.registerHelper('block', function(name) {
      var val = (blocks[name] || []).join('\n');

      // clear the block
      blocks[name] = [];
      return val;
    });

    app.use(express.static(__dirname + '/public'))

    app.use(bodyParser.json()) // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    }))
    app.use(session({
      secret: 'todotopsecret'
    }))

    function compile(str, path) {
      return stylus(str)
        .set('filename', path)
        .use(nib())
    }

    function reactiverFenetre(){
      console.log("creationFenetreEvent emit")
      creationFenetreEvent.emit('success', urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/')
    }

    reactiverFenetre()

    app.get('/', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/')
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/index'
      res.redirect(uri)
    })

    app.get('/index', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/index')
      res.locals = {
        intervention: codeTypeIntervention,
        voie: codeVoies,
        horaires: codeHorairesIntervention,
        lignesFacturation: entreprise.lignesFacturation,
        nomsTypesVoie
      }
      let numFact = dateFormat(new Date().getTime(), 'yyyy-mm-dd-HHMM')
      let dateNow = dateFormat(new Date().getTime(), 'yyyy-mm-dd')
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final'

      //donneesIntervention = donneesEssai
      res.render('index', {
        title: 'Home',
        donneesIntervention,
        testGarantie,
        dateNow,
        numFact,
        windowRedirect: uri
      })
    })

    app.post('/recapitulation', function(req, res) {
      donneesIntervention = req.body
      console.log("donnees : " + JSON.stringify(donneesIntervention))
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final'
      recapitulationEvent.emit('success', uri)
    })

    app.post('/corriger', function(req, res) {
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/index'
      recapitulationEvent.emit('success', uri)
    })

    app.post('/enregistrer', function(req, res) {
      console.log("Requete enregistrer pdf")
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final'
      let titre = donneesIntervention.nomClient + "_" + donneesIntervention.prenomClient + "_" + dateDocument + ".pdf"
      enregistrerPDFEvent.emit('success', uri, titre)
    })

    app.get('/final', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final')
      res.locals = {
        entreprise: entreprise.entreprise,
        garantie: entreprise.garantie
      }
      if (donneesIntervention.garantie == "Hors-Garantie") {
        testGarantie = true
      } else {
        testGarantie = false
      }

      let testNext = req.query.test
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/completer'

      if (testNext == "true") {
        res.render('final', {
          title: 'fiche Terminée',
          donneesIntervention,
          testGarantie,
          testNext,
          windowRedirect: uri
        })
      } else {
        res.render('final', {
          title: 'fiche Terminée',
          donneesIntervention,
          testGarantie,
          windowRedirect: uri
        })
      }
    })

    app.get('/completer', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/completer')
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final'
      res.locals = {
        intervention: codeTypeIntervention,
        voie: codeVoies,
        horaires: codeHorairesIntervention,
        lignesFacturation: entreprise.lignesFacturation,
        nomsTypesVoie
      }
      res.render('completer', {
        title: 'completer fiche',
        numFact: donneesIntervention.numeroFacture,
        donneesIntervention,
        windowRedirect: uri
      })
    })

    app.get('/printpdf', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/ficheintervention')
      res.locals = {
        entreprise: entreprise
      }
      if (donneesIntervention.garantie == "Hors-Garantie") {
        testGarantie = true
      } else {
        testGarantie = false
      }
      res.render('printpdf', {
        title: 'Fiche Intervention',
        donneesIntervention,
        testGarantie,
      })
    })

    app.post('/printpdfdocument', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/printpdfdocument')
      let uri = urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/final'
      htmlToPDF(uri)
      //scrapingPDF(urlObject.href + "printpdf")
      return true
    })

    app.get('/pdf', function(req, res) {
      console.log('page demandée : ' + urlObject.protocol + "//" + urlObject.hostname + ":" + urlObject.port + '/pdf')
      console.log("fichierTemporaire : " + fichierTemporaire)
      res.sendFile(fichierTemporaire)
    })

    app.get('/close', function(req, res) {
      console.log("\nFin d'application")
      server.close()
      process.exit(2)
    })
  }

  function genererCodeAvecJson(objectJS) {
    let code = ''
    for (i = 0; i < Object.keys(objectJS).length; i++) {
      let key = Object.keys(objectJS)[i]
      code = code + '<option value="' + objectJS[key] + '">' + objectJS[key] + '</option>\n'
    }
    return code
  }

  chargerTypeVoie.on("success", function() {
    lireFichierCall(__dirname + '/public/conf/typesIntervention.json', function(data) {
      typesIntervention = JSON.parse(data.toString('utf8'))
      nomsTypesVoie = typesVoie.voies
      chargerTypeIntervention.emit('success')
    })
  })
  chargerTypeIntervention.on('success', function() {
    lireFichierCall(__dirname + '/public/conf/entreprise.json', function(data) {
      entreprise = JSON.parse(data.toString('utf8'))
      chargerEntreprise.emit('success')
    })
  })
  chargerEntreprise.on('success', function() {
    codeTypeIntervention = genererCodeAvecJson(typesIntervention.typesIntervention)
    console.log("Code Type Intervention généré")
    codeHorairesIntervention = genererCodeAvecJson(typesIntervention.horairesTranches)
    console.log("Code horaires Tranches généré")
    codeVoies = genererCodeAvecJson(typesVoie.typesVoies)
    console.log("Code Voie généré")
    main()
  })

  finishRequestEvent.on('success', function() {
    console.log("impression pdf réussie")

  })
  init()

}

module.exports.interventionServer = interventionServer
