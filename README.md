# Scoundrel

Ein Browserspiel in Pixel-Art nach dem Solitär-Kartenspiel **Scoundrel** von Zach Gage und Kurt Bieg (2011). Du kämpfst dich mit 20 Lebenspunkten durch einen Dungeon aus 44 Spielkarten. Monster, Waffen und Heiltränke liegen dabei offen vor dir.

![Spieltisch mit Raum, angelegter Doppelaxt und erschlagenen Monstern](docs/screenshot.png)

Die Oberfläche ist komplett auf Deutsch. Das Spiel läuft ohne Installation und ohne Build-Schritt direkt im Browser, auch auf dem Handy.

## Funktionen

- **Alle 44 Karten als Pixel-Art:** 13 Monster von der Ratte bis zum Drachen, in Kreuz- und Pik-Farbvarianten, 9 Waffen vom Knüppel bis zur Runenklinge und Heiltränke in mehreren Größen. Alle Grafiken werden zur Laufzeit auf Canvas gezeichnet, Bilddateien gibt es keine.
- **Regeln wie im Original** (Version 1.0 vom 15. August 2011), inklusive Waffen-Stapelregel und offizieller Wertung.
- **Scharfe Pixel auf jedem Bildschirm:** Das Layout skaliert in ganzzahligen Schritten, vom Handy bis 1920 × 1080.
- **Animationen und Sound:** Karten fliegen über den Tisch, Treffer lassen das Bild wackeln. Soundeffekte und eine optionale Chiptune-Musik entstehen per WebAudio.
- **Tagesdungeon:** Alle Spieler bekommen am selben Tag dieselbe Kartenfolge.
- **Fortschritt im Browser:** Bestwerte und ein laufendes Spiel bleiben im `localStorage` des jeweiligen Browsers gespeichert.

## Spielregeln in Kürze

| Karten | Bedeutung |
| --- | --- |
| ♣ ♠ Kreuz und Pik (26) | **Monster.** Schaden = Wert: 2–10, Bube 11, Dame 12, König 13, Ass 14 |
| ♦ Karo 2–10 (9) | **Waffen.** Ziehen ihren Wert vom Monsterschaden ab |
| ♥ Herz 2–10 (9) | **Heiltränke.** Heilen ihren Wert, aber nie über 20 |

Rote Bildkarten, rote Asse und Joker sind aussortiert.

1. Es liegen immer 4 Karten offen, das ist der **Raum**.
2. Du kannst **fliehen**. Dann wandern alle 4 Karten unter den Dungeon. Zweimal hintereinander fliehen geht nicht.
3. Bleibst du, nimmst du **3 der 4 Karten** nacheinander. Die vierte bleibt für den nächsten Raum liegen.
4. **Waffen** musst du anlegen. Die alte Waffe und die Monster darauf kommen auf die Ablage.
5. **Heiltränke:** Pro Raum wirkt nur einer, ein zweiter verfällt ohne Wirkung.
6. **Kampf:** Mit bloßen Fäusten verlierst du den vollen Monsterwert. Mit der Waffe verlierst du nur *Monster minus Waffe* (mindestens 0). Danach trifft die Waffe nur noch Monster, die **kleiner oder gleich** dem zuletzt damit erschlagenen sind.

**Wertung:** Kommst du durch, sind deine restlichen Leben deine Punkte. Bei genau 20 Leben zählt der Wert eines Heiltranks dazu, wenn er deine letzte Karte war. Stirbst du, wird die Summe aller übrigen Monster abgezogen und das Ergebnis ist negativ.

Die vollständigen Regeln mit Beispiel stehen im Spiel unter **?**.

## Steuerung

| Aktion | Maus / Touch | Tastatur |
| --- | --- | --- |
| Karte nehmen | Karte anklicken oder antippen | `1` – `4` |
| Mit Waffe kämpfen | „Waffe“ im Kampfmenü | `W` |
| Mit Fäusten kämpfen | „Faust“ im Kampfmenü | `F` |
| Fliehen | „Fliehen“ | `F` |
| Ton an/aus | Lautsprecher-Symbol | `M` |
| Menü / Abbrechen | Menü-Symbol | `Esc` |

## Lokal spielen

`index.html` im Browser öffnen, mehr ist nicht nötig. Die Pixelschriften kommen von Google Fonts. Ohne Internetverbindung nutzt das Spiel eine Ersatzschrift.

Alternativ geht es mit einem lokalen Webserver, zum Beispiel:

```bash
python -m http.server 8765
```

Danach `http://localhost:8765` aufrufen.

## Mit GitHub Pages veröffentlichen

1. Repository auf GitHub pushen.
2. **Settings → Pages → Build and deployment**: Bei *Source* „Deploy from a branch“ wählen, Branch `main`, Ordner `/ (root)`.
3. Nach kurzer Zeit läuft das Spiel unter `https://<benutzername>.github.io/<repository>/`.

Mit einem kostenlosen GitHub-Konto funktioniert Pages nur bei öffentlichen Repositories.

## Projektstruktur

```text
index.html       Seitengerüst, Overlays und Spielregeln
css/style.css    Gestaltung, Pixelraster und Layout für schmale Bildschirme
js/sprites.js    Pixel-Art: Sprites, Kartenrenderer, Icons
js/audio.js      Soundeffekte und Musik per WebAudio
js/game.js       Spiellogik, Darstellung, Animationen und Eingaben
build.mjs        Erzeugt eine einzelne HTML-Datei mit eingebettetem CSS und JS
```

## Einzeldatei erzeugen

Für Umgebungen, die genau eine HTML-Datei erwarten (zum Beispiel Claude-Artifacts), bettet `build.mjs` CSS und JavaScript ein und lässt das HTML-Gerüst weg:

```bash
node build.mjs
```

Das Ergebnis landet in `dist/scoundrel.html`. Der Ordner steht in der `.gitignore`. Für GitHub Pages wird er nicht gebraucht.

## Credits

- **Spielidee und Regeln:** *Scoundrel* von Zach Gage und Kurt Bieg (2011). Dieses Projekt ist eine inoffizielle Fan-Umsetzung und steht in keiner Verbindung zu den Autoren.
- **Schriften:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) von CodeMan38 und [VT323](https://fonts.google.com/specimen/VT323) von Peter Hull, beide unter der SIL Open Font License und über Google Fonts eingebunden.

## Lizenz

Code und Pixel-Art stehen unter der [MIT-Lizenz](LICENSE).
