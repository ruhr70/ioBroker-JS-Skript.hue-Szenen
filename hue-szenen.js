// hue Szenzen - Script für ioBroker
// V 0.3.1
//
// es empfiehlt sich den hue-Adapter-Loglevel auf "warn" zu stellen (viele Farbänderungen)
//
// Benutzung über Vis, bzw. Datenpunkte
// ------------------------------------
//
// die Szenen können über Datenpunkte, z.B. über Vis eingeschaltet und gesteuert werden.
//
// javascript.0.hue.szene.arbeitszimmer.szene = "love" -> schaltet die Szene "love" im Arbeitszimmer ein
// javascript.0.hue.szene.arbeitszimmer.szene = "aus"  -> schaltet die aktive Szene im Arbeitszimmer aus, die Lampen gehen aus
// javascript.0.hue.szene.arbeitszimmer.szene = "stop" -> stoppt die Szene, die Lampen der Gruppe "arbeitszimmer" leuchten weiter
//
// javascript.0.hue.szene.arbeitszimmer.bri_inc = -16  -> reduziert de Helligkeit der Szene um 16 Punkte
//
// javascript.0.hue.szene.arbeitszimmer.bri     = 200  -> ändert die Helligkeit der Szene direkt auf den Wert 200
// javascript.0.hue.szene.arbeitszimmer.sat     = 200  -> ändert die Sättigung  der Szene direkt auf den Wert 200
//
//
// Benutzung über Javascript (Funktionen)
// --------------------------------------
//
// szeneStart(lampenGruppe,szene,bri); // bri ist optional
//
// Beispiel:
//
// szeneStart("wohnzimmer","sonne");  // startet in der Lampengruppe "wohnzimmer" die Szene "sonne"
//
//
// szeneStop(lampenGruppe);
//
//
// lampenAus(lampenGruppe);
//
//
//
//
//
//
//
//

// todo
// ----
//
// Rotalarm     Effekt
// Feuer        Effekt
//
// prüfen:
// -------
//
//
// erledigt:
// ---------
// bri          optional übergeben (zur Laufzeit veränderbar)
// Einschaltzeit beim ersten Einschalten
// sat          optional übergeben (zur Laufzeit veränderbar)
// Änderungen sat, bri per on() überwachen und Lampen in aktiver Gruppe sofort anpassen
// neue DP Strukutur ()
//
//


// ------------ ANFANG der individuellen Konfiguration ------------


// die eigenen Lampen in Gruppen sortiert (die Farbverläufe und Effekte werden nach Gruppen aktiviert)

var lampen ={
    "wohnzimmer":       // Lampengruppe
        [
            "hue.0.Hue_2_AZ.wohnzimmer.kugel",
            "hue.0.Hue_2_AZ.wohnzimmer.stehlampe.oben",
            "hue.0.Hue_2_AZ.wohnzimmer.stehlampe.mitte",
            "hue.0.Hue_2_AZ.wohnzimmer.stehlampe.unten",
            "hue.0.Hue_2_AZ.küche.kühlschrank.lc"
        ],
    "schlafzimmer":     // Lampengruppe
        [
            "hue.0.Hue_2_AZ.schlafzimmer.decke.hinten.links",
            "hue.0.Hue_2_AZ.schlafzimmer.decke.hinten.mitte",
            "hue.0.Hue_2_AZ.schlafzimmer.decke.hinten.rechts",
            "hue.0.Hue_2_AZ.schlafzimmer.decke.vorne.links",
            "hue.0.Hue_2_AZ.schlafzimmer.decke.vorne.mitte",
            "hue.0.Hue_2_AZ.schlafzimmer.decke.vorne.rechts"
        ],
    "arbeitszimmer":    // Lampengruppe
        [
            "hue.0.Hue_2_AZ.arbeitszimmer.schreibtisch.ls",
            "hue.0.Hue_2_AZ.arbeitszimmer.vorhang",
            "hue.0.Hue_2_AZ.arbeitszimmer.regal.li.re"
        ]
};



var hueSzenenApapterPfad = "hue.szene.";    // wo sollen die Datenpunkte in den ioBroker Objekten angelegt werden
                                            // je Lampengruppe werden die Datenpunkte:
                                            // .szene       -> Änderung der Szene per Datenpunkt, z.B. über VIS oder im Script per szeneStart(lampenGruppe,szene,bri);
                                            // .bri         -> Änderung der Helligkeit per Datenpunkt (0-254)
                                            // .sat         -> Änderung der Farbsättigung per Datenpunkt ())0-254)
                                            // .bri_inc     -> Erhöhung/Verminderung der Helligkeit per Datenpunkt (positiver Wert = Heller, negativer Wert = dunkler)
                                            // .sat_inc     -> Erhöhung/Verminderung der Sättigung per Datenpunkt  (positiver Wert = mehr Farbe, negativer Wert = blasser)
                                            // angelegt
                                            // z.B. unter: javascript.0.hue.szene.arbeitszimmer.szene (Javascfript Instanz 0, Pfad = "hue.szene.")


// globaler Parameter: Zufällige Zeit zwischen den Wechsel zwischen zwei Farben, je Lampe, in der aktivierten Szene in ms
// (wenn keine individuelle Zeit in der Szene definiert ist)
var delayMin =  1000;   // minimale Zeit in ms einer Lampe, um in die nächste Farbe zu wechseln
var delayMax =  3000;   // maximale Zeit in ms einer Lampe, um in die nächste Farbe zu wechseln




// ------------ ENDE der individuellen Konfiguration ------------







// -------------------------------------------------------------------------
// Script: Logik & Szenen - ab hier muss in der Regel nichts geändert werden
// -------------------------------------------------------------------------


var szenen = {
    "beispiel":
    {
        "description":  "Beispielszene",    // optional: Beschreibung der Szene
        "delayMin":     2000,               // optional (ohne werden die globalen Einstellungen verwendet)
        "delayMax":     9000,               // optional (ohne werden die globalen Einstellungen verwendet)
        "hueMin":       0,                  // niedrigste Farbe im Verlauf
        "hueMax":       50000               // höchste Farbe im Verlauf
    },
    "kamin":
    {
        "description":  "roter Farbverlauf",
        "hueMin":       0,
        "hueMax":       10000
    },
    "wald":
    {
        "description":  "grüner Farbverlauf",
        "hueMin":       20000,
        "hueMax":       27000
    },
    "sonne":
    {
        "description":  "gelb/oranger Farbverlauf",
        "hueMin":       10000,
        "hueMax":       17000
    },
    "blau":
    {
        "description":  "Energie, blauer Farbverlauf",
        "hueMin":       44000,
        "hueMax":       48000
    },
    "strobo":
    {
        "description":  "Stroboskop",
        "ct":           153,
        "delayMin":     500,
        "delayMax":     800
    },
    "feuer":
    {
        "description":  "pulsierende Farben",
        "delayMin":     200,
        "delayMax":     600,
        "hueMin":       0,
        "hueMax":       17000
    },
    "regenbogen":
    {
        "description":  "das gesamte Farbspektrum",
        "delayMin":     1000,
        "delayMax":     8000,
        "hueMin":       0,
        "hueMax":       65355
    },

    "love":
    {
        "description":  "langsam wechselnder Farbverlauf im lila/violetten Bereich, bis zu den Endpunkten blau und rot",
        "delayMin":     5000,
        "delayMax":     8000,
        "hueMin":       46920,
        "hueMax":       65355
    }
};




// ##### Script Variablen #####

var timer =             {};
var nextDelay =         {};
var szeneAktiv =        [];
var szene =             [];


//  ##### Script Funktionen #####

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dpAnlegen() {
    for (var lampenGruppe in lampen) {
        createState(hueSzenenApapterPfad + lampenGruppe + ".szene","aus");
        createState(hueSzenenApapterPfad + lampenGruppe + ".infoAktiveSzene","keine");
        createState(hueSzenenApapterPfad + lampenGruppe + ".bri",254);
        createState(hueSzenenApapterPfad + lampenGruppe + ".bri_inc",0);
        createState(hueSzenenApapterPfad + lampenGruppe + ".sat",254);
        createState(hueSzenenApapterPfad + lampenGruppe + ".sat_inc",0);
        log(hueSzenenApapterPfad + lampenGruppe + " wurde angelegt","info");
    }
}

function restoreSzenen() {
    for (var lampenGruppe in lampen) {
        var aktiveSzene = getState(hueSzenenApapterPfad + lampenGruppe + ".szene").val;
        var bri = getState(hueSzenenApapterPfad + lampenGruppe + ".bri").val;
        if (aktiveSzene != "aus") {
            log("im der Gruppe: " + lampenGruppe + " wurde die Szene: " + aktiveSzene + " wieder aktiviert.");
            setState(hueSzenenApapterPfad + lampenGruppe + ".infoAktiveSzene",aktiveSzene);
            szeneStart(lampenGruppe,aktiveSzene,bri);
        }
    }
}

function varsAnlegen() {
    // Script-Variablen für jede Lampengruppe anlagen
    for (var lampenGruppe in lampen) {
        timer[lampenGruppe] =           [];
        nextDelay[lampenGruppe] =       [];
        szeneAktiv[lampenGruppe] =      false;
        szene[lampenGruppe] =           null;
        // Script-Variablen für jede Lampe in jeder Lampengruppe anlegen
        for (var i = 0; i < lampen[lampenGruppe].length; i++) {                 // timer und die nächste Delayzeit für jede Lampe zurückstellen
            timer[lampenGruppe][i] = null;
            nextDelay[lampenGruppe][i] = 0;
        }
    }
}

function szenenwechsel (lampenGruppe,lampe,delay) {
    delay = Math.floor(delay / 100);                                            // der zufällige Wert für die nächste Lichtfarbe wird auch als transitiontime verwendet (dazu wird das delay durch 100 geteilt)
    //log("aktive Szene: hueMin: " + szenen[szene[lampenGruppe]]["hueMin"] + " hueMax: " + szenen[szene[lampenGruppe]]["hueMax"]);
    var hue = rand(szenen[szene[lampenGruppe]].hueMin,szenen[szene[lampenGruppe]].hueMax);
    var bri = getState(hueSzenenApapterPfad + lampenGruppe+".bri").val;
    var sat = getState(hueSzenenApapterPfad + lampenGruppe+".sat").val;
    var command = '{"on":true,"hue":' + hue + ',"sat":' + sat + ',"bri":' + bri + ',"transitiontime":' + delay + ',"colormode":"hs"}';
    //log ("Lampe: " + lampen[lampenGruppe][lampe] + " # command: " + command);
    if (bri === 0) command = '{"on":false,"bri":0}';
    setState(lampen[lampenGruppe][lampe] + ".command", command);
}

function stroboskop(lampenGruppe,lampe) {
    var command = '{"on":true,"ct":153,"bri":254,"transitiontime":0,"colormode":"ct"}';
    setState(lampen[lampenGruppe][lampe] + ".command", command);
    command = '{"on":false,"transitiontime":0}';
    setState(lampen[lampenGruppe][lampe] + ".command", command);
}

function berechneDelay (lampenGruppe,lampe){
    // globale Delay-Einstellungen übernehmen
    var delayMinTemp = delayMin;
    var delayMaxTemp = delayMax;
    // globale Delay-Einstellungen überschreiben, wenn in der Szene ein eingener Delay definiert ist
    if (szenen[szene[lampenGruppe]].delayMin) delayMinTemp = szenen[szene[lampenGruppe]].delayMin;
    if (szenen[szene[lampenGruppe]].delayMax) delayMaxTemp = szenen[szene[lampenGruppe]].delayMax;
    nextDelay[lampenGruppe][lampe] = rand(delayMinTemp,delayMaxTemp);
}

function szeneTimer(lampenGruppe,lampe) {
    var delay = nextDelay[lampenGruppe][lampe] || 0;
    var aktuelleSzene = szene[lampenGruppe];
    //log("gesetztes Delay: " + delay);
    if (timer[lampenGruppe][lampe]) clearTimeout(timer[lampenGruppe][lampe]);
    timer[lampenGruppe][lampe]  = setTimeout(function() {
        timer[lampenGruppe][lampe] = null;
        berechneDelay(lampenGruppe,lampe);
        switch (aktuelleSzene) {
            case "strobo":
                stroboskop(lampenGruppe,lampe);
                break;
            default:
                szenenwechsel(lampenGruppe,lampe,nextDelay[lampenGruppe][lampe]);
                break;
        }
        //log("Delay = " + nextDelay[lampenGruppe][lampe] + " # Lampe: " + lampen[lampenGruppe][lampe]);
        szeneTimer(lampenGruppe,lampe); // ruft den Timer nach Ablauf wieder auf
    },delay);
}

function check254(check) {
    if (check !== 0) if (!check) check = 254;
    check = parseInt(check);
    if (check > 254) check =254;
    if (check <= 0 ) check = 0;
    return check;
}

function setBri(lampenGruppe,aktiveSzene,bri) {
    if (szenen[aktiveSzene].bri) bri = szenen[aktiveSzene].bri;
    bri = check254(bri);
    setState(hueSzenenApapterPfad + lampenGruppe+".bri", bri);
}

function setSat(lampenGruppe,aktiveSzene,sat) {
    if (szenen[aktiveSzene].sat) sat = szenen[aktiveSzene].sat;
    sat = check254(sat);
    setState(hueSzenenApapterPfad + lampenGruppe+".sat", sat);
}

function szeneStart(lampenGruppe,aktiveSzene,bri,sat) {
    if (!szenen[aktiveSzene]) {                                                 // undefinierte Szenen abfangen
        log("# hue Szenen Script: undefinierte Szene wurde versucht aufzurufen: " + aktiveSzene,"error");
        return;
    }
    szene[lampenGruppe] = aktiveSzene;
    setBri(lampenGruppe,aktiveSzene,bri);
    setSat(lampenGruppe,aktiveSzene,sat);
    if (!szeneAktiv[lampenGruppe]) {
        szeneAktiv[lampenGruppe] = true;
        for (var i = 0; i < lampen[lampenGruppe].length; i++) {                 // für alle Lampen den timer starten
            nextDelay[lampenGruppe][i] = 0;
            szeneTimer(lampenGruppe,i);
        }
    }
}

function szeneStop(lampenGruppe) {                                              // alle aktiven timer löschen
    for (var i = 0; i < lampen[lampenGruppe].length; i++) {
        clearTimeout(timer[lampenGruppe][i]);
        log("Timer: " + lampen[lampenGruppe][i] + " gestoppt");
    }
    szeneAktiv[lampenGruppe] =  false;
    szene[lampenGruppe] =       null;
}

function lampenAus(lampenGruppe) {
    for (var i = 0; i < lampen[lampenGruppe].length; i++) {
        setState(lampen[lampenGruppe][i]+".command",'{"on":false}');
    }
}

function setBriSat(com,wert,lampenGruppe) {
    if (wert != check254(wert)) {
        wert = check254(wert);
        setState(hueSzenenApapterPfad + lampenGruppe + "." + com, wert);    //korrigiert bri/sat und  ruft diese on() Funktion direkt wieder auf
    } else {
        //log("Lampengruppe: " + lampenGruppe + " # " + com + ": " + wert + " empfangen","warn");
        if (szeneAktiv[lampenGruppe]) {                                         // wenn die Szene in der Gruppe aktiv ist:
            for (var i = 0; i < lampen[lampenGruppe].length; i++) {             // für alle Lampen der Gruppe
                setState(lampen[lampenGruppe][i] + "." + com, wert);            // die Helligkeit/Saturation direkt ändern
                //log(com + ": " + wert + " # " + lampen[lampenGruppe][i] + " gesetzt","warn");
            }
        }
    }
}

function changeBriSat (com, wert, lampenGruppe) {
    com = com.replace("_inc", "");
    var alterWert = getState(hueSzenenApapterPfad + lampenGruppe + "." + com).val;
    wert = parseInt(wert) + alterWert;
    setState(hueSzenenApapterPfad + lampenGruppe + "." + com, wert);            //setzt bri/sat neu. Dies ruft die on() Funktion direkt wieder auf, diesmal mit bri/sat
}





//  ##### Überwachte Datenpunkte #####


// Änderung der Helligkeit (.bri) oder Farbsättigung (.sat) während der Laufzeit über einen Datenpunkt

var reg = new RegExp("^javascript\\.\\d+\\." + hueSzenenApapterPfad.replace('.', '\\.') + ".*\\.(sat|bri)");
on({"id":reg , "change": "ne"}, function (obj) {
    var com = obj.id.split('.').pop();
    var	str = obj.id.replace(/\.(bri|sat)$/, "");
    var reg2 = new RegExp("^javascript\\.\\d+\\."+ hueSzenenApapterPfad.replace('.', '\\.'));
    var lampenGruppe = str.replace(reg2, "");
    var wert = obj.newState.val;
    setBriSat (com, wert, lampenGruppe);
});


// Änderung der Helligkeit oder Farbsättignung als adaptiver Wert (.bri_inc, .sat_inc)

var reg = new RegExp("^javascript\\.\\d+\\." + hueSzenenApapterPfad.replace('.', '\\.') + ".*\\.(sat_inc|bri_inc)");
on({"id":reg , "change": "any"}, function (obj) {
    var com = obj.id.split('.').pop();
    var	str = obj.id.replace(/\.(sat_inc|bri_inc)$/, "");
    var reg2 = new RegExp("^javascript\\.\\d+\\."+ hueSzenenApapterPfad.replace('.', '\\.'));
    var lampenGruppe = str.replace(reg2, "");
    var wert = obj.newState.val;
    changeBriSat (com, wert, lampenGruppe);
});


// Änderung einer Szene während der Laufzeit, z.B. über VIS

var reg = new RegExp("^javascript\\.\\d+\\." + hueSzenenApapterPfad.replace('.', '\\.') + ".*\\.szene");
on(reg , function (obj) {
    var	str = obj.id.replace(/\.szene$/, "");
    var reg2 = new RegExp("^javascript\\.\\d+\\."+ hueSzenenApapterPfad.replace('.', '\\.'));
    var lampenGruppe = str.replace(reg2, "");
    var neueSzene =         obj.newState.val;
    log("Lampengruppe: " + lampenGruppe + " # Szene: " + neueSzene + " empfangen");
    switch (neueSzene) {
        case "aus":
            szeneStop(lampenGruppe);
            lampenAus(lampenGruppe);
            log(lampenGruppe + " Szene deaktiviert");
            break;
        case "stop":
            szeneStop(lampenGruppe);
            log(lampenGruppe + " Szene angehalten");
            break;
        default:
            if (szenen[neueSzene]) {
                // TODO: bri nur ermitteln, wenn in der Szene kein eigener bri festgelegt ist
                var bri = getState(hueSzenenApapterPfad + lampenGruppe+".bri").val;
                bri = check254(bri);
                if (bri === 0) bri = 254;
                szeneStart(lampenGruppe,neueSzene,bri);
                setState(hueSzenenApapterPfad + lampenGruppe+".infoAktiveSzene", neueSzene);
                log(lampenGruppe + " Szene: " + neueSzene + " gestartet");
                break;
            }
            log("### unbekannte Szene: " + neueSzene,"error");
            break;
    }
});




//  ##### Scriptstart #####

dpAnlegen();        // je einen Datenpunkt pro Lampengruppe anlegen
varsAnlegen();      // die für das Script notwendigen Variablen erstellen


// warte bis alle States und Objekte angelegt werden.
// 500ms und dann starte main();
function main() {

//  ##### Scriptstart main() #####

    restoreSzenen();    // aktiviert zuletzt eingestellte Szenen

}
setTimeout(main, 500);

