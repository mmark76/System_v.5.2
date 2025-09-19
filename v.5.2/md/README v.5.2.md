# README — Markellos Chess Mnemonic System v.5.2

## 📌 Σκοπός
Το **Markellos Chess Mnemonic System** είναι μια web εφαρμογή που συνδυάζει το σκάκι με μνημονικές τεχνικές (PAO, loci, anchors, verses).  
Επιτρέπει στον χρήστη να:
- εισάγει και αναλύει παρτίδες PGN,  
- αποθηκεύει κινήσεις με FEN αναπαράσταση,  
- συνδέει SAN με μνημονικά στοιχεία (Temporal, Spatial, Characters, PAO, Verses),  
- χρησιμοποιεί εργαλείο **FEN Builder** για ειδικές θέσεις,  
- εξάγει δεδομένα σε CSV/JSON για περαιτέρω μελέτη.

---

## 📂 Δομή Project

- `Markellos Chess Mnemonic System v5.2.html` → Κύριο UI  
- `css/styles.css` → Dark theme (κύρια εφαρμογή)  
- `css/fen-builder.css` → Light theme (FEN Builder)  
- `js/main.js` → Φόρτωση βιβλιοθηκών, κουμπί FEN Builder  
- `js/pgn.js` → Parsing PGN, γέμισμα SAN Table  
- `js/fen-builder.js` → Λογική FEN Builder (εισαγωγή/εξαγωγή FEN)  
- `data/libraries_v3.2.json` → Όλες οι βιβλιοθήκες (Temporal, Spatial, Characters, PAO 0–9, PAO 00–99, Verses, Foundations)  
- `fen-builder.html` → Pop-up εργαλείο FEN  
- `kamsky_kramnik_1993.pgn` → Παράδειγμα PGN

---

## ⚙️ Λειτουργίες

### 1. PGN / SAN Table
- Επικόλληση ή import PGN (κουμπιά **Import PGN / Parse PGN**).  
- Αυτόματη ανάλυση με `chess.js`.  
- Δημιουργία **SAN Table** με στήλες:  
  `#`, `SAN`, `Locus`, `Anchor`, `Color`, `Piece`, `Target Square`, `FEN`.

### 2. Associations / PAO / Verse Tables
- Επιλογή **Πίνακα**:  
  - SAN  
  - Associations  
  - PAO 0–9  
  - PAO 00–99  
  - Verse  
  - All-Tables (όλοι μαζί)
- Συμπλήρωση μέσω βιβλιοθηκών.

### 3. Libraries
- Επιλογή **Βιβλιοθήκης**:  
  - Temporal (LibraryT1, LibraryT2)  
  - Spatial (LibraryS1)  
  - Characters (LibraryC1, LibraryC2)  
  - PAO (LibraryP1, LibraryP2, LibraryP3)  
  - Verses (LibraryV1)  
  - Foundations  
  - All-Libraries

### 4. FEN Builder (popup)
- Σκακιέρα drag & drop με spare pieces.  
- Επιλογές:
  - Side-to-move (White/Black)  
  - Castling availability  
  - Import FEN string → εμφάνιση θέσης  
  - Export/copy current FEN  
  - Clear / Start position  

### 5. Εξαγωγή Δεδομένων
- Λειτουργία download (CSV, JSON) για SAN, PAO, Associations.

---

## 🎨 UI / UX
- **Κύριο UI**: Dark theme (μαύρο φόντο, λευκά γράμματα, sticky header/footer).  
- **FEN Builder**: Light theme, λευκό background.  
- Responsive tables (οριζόντια κύλιση).  
- Sticky headers/footers για σταθερή προβολή.

---

## 🔗 Εξαρτήσεις
- [chess.js](https://github.com/jhlywa/chess.js)  
- [chessboard.js](https://chessboardjs.com/)  
- jQuery  
- (προαιρετικά) PapaParse, FileSaver.js για exports

---

## 📜 Παράδειγμα Χρήσης
1. Εισάγετε ένα PGN (π.χ. από το `kamsky_kramnik_1993.pgn`).  
2. Πατήστε **Parse PGN** → γέμισμα του SAN Table.  
3. Επιλέξτε βιβλιοθήκη (π.χ. Temporal) και συνδέστε loci σε κινήσεις.  
4. Χρησιμοποιήστε το **FEN Builder** για ειδική θέση και αντιγράψτε το FEN.  
5. Εξάγετε τα δεδομένα σας σε CSV/JSON για μελέτη.

---



## 🔑 Κανόνες v.5.2

### Κοινά για όλους τους πίνακες
- Move #: `1.` για λευκά, `1...` για μαύρα
- SAN: πλήρες (με +, #, !, ?)
- Locus: μόνο από LibraryT1, μορφή `αριθμός — περιγραφή`, μόνο στις λευκές κινήσεις
- Anchor: μόνο από LibraryT2, μορφή `αριθμός — περιγραφή`, εμφανίζεται ΜΟΝΟ σε κινήσεις πολλαπλάσιες του 7
- Χρώμα: «Λευκό» ή «Μαύρο» (μονογλωσσικό)
- Όλοι οι πίνακες με σταθερό ύψος + scroll

### SAN Table
- Piece: συνδυασμός γράμμα + όνομα (π.χ. `N — Ίππος`)
- Target Square: μόνο τετράγωνο (π.χ. `e4`)
- FEN: ολόκληρο FEN string

### Associations Table
- Piece Association: μόνο από LibraryC2
- Target Square Association: μόνο από LibraryS1 (Spatial)

### PAO 0–9 Table
- PAO Code: 3ψήφιος P–F–R (π.χ. `241 (Nf3)`)
- PAO: 1 στήλη, σε 3 γραμμές (Person, Action, Object)
- Πηγή: μόνο LibraryP1
- Υπολογισμός: πάντα από το to τετράγωνο
- Γλώσσα: ακολουθεί global dropdown

### PAO 00–99 Table
- PAO Code: 6ψήφιος από πλήρη κίνηση (ζεύγος Λ/Μ), π.χ. `Nf3 Nd5 → 263245`
- PAO: 1 στήλη, σε 3 γραμμές (Person, Action, Object)
- Πηγή: LibraryP2 ή LibraryP3 (dropdown επιλογής)
- Γλώσσα: ακολουθεί global dropdown

### Verse Table
- Verse: 1 στήλη, σε 4 γραμμές (Piece, File, Rank, Closing)
- Πηγή: μόνο LibraryV1 (Verses)
- Γλώσσα: ακολουθεί global dropdown




## 🖥️ UI & Buttons (v.5.2)

### Global Controls
- **Import PGN**: Επιλογή αρχείου PGN από τοπικό δίσκο.
- **Parse PGN**: Ανάλυση του PGN και γέμισμα όλων των πινάκων.
- **Clear**: Καθαρισμός PGN input και πινάκων.
- **Download**: Εξαγωγή όλων των πινάκων σε CSV (SAN, Associations, PAO 0–9, PAO 00–99, Verse).

### Table Controls
- Κάθε πίνακας έχει δικό του κουμπί **Download CSV** για εξαγωγή μεμονωμένου πίνακα.
- **SAN Table**: Dropdowns για Locus (LibraryT1) και Anchor (LibraryT2).
- **Associations Table**: Dropdowns για Locus (T1), Anchor (T2), Characters (C2 fixed), Targets (S1 fixed).
- **PAO 0–9 Table**: Dropdowns για Locus (T1), Anchor (T2), Codes (P1 fixed).
- **PAO 00–99 Table**: Dropdowns για Locus (T1), Anchor (T2), Collection (P2/P3 επιλογή).
- **Verse Table**: Dropdowns για Locus (T1), Anchor (T2), Verses (V1 fixed).

### FEN Builder (Pop‑Up)
- Κουμπιά: **Άδειασε σκακιέρα**, **Αρχική θέση**, **Εισαγωγή FEN**, **Αντιγραφή FEN**.
- Επιλογές: **To Move (White/Black)**, **Castling Rights** (Wk, WQ, Bk, BQ).
- Drag & Drop κομμάτια με **Spare Pieces**.
- Τρέχον FEN εμφανίζεται και μπορεί να αντιγραφεί.

### Footer
- Εμφανίζει `© Markellos Markides, 2025 — Markellos Chess Mnemonic System v5`.




## 🔄 Νέα στοιχεία στην v.5.2

1. **Anchor Rule**
   - Εμφανίζεται μόνο σε λευκές κινήσεις που είναι πολλαπλάσιο του 7.

2. **Εμφάνιση Πινάκων**
   - Όλοι οι πίνακες έχουν σταθερό ύψος + scroll.
   - Εμφανίζεται ένας πίνακας κάθε φορά, με επιλογή από dropdown ή κουμπιά.

3. **Verse Table**
   - Η στήλη Verse εμφανίζεται σε 4 κάθετες γραμμές (Piece, File, Rank, Closing).
   - Προέρχεται αποκλειστικά από LibraryV1.

4. **Libraries UI**
   - Προσθήκη μπάρας με κουμπιά ανά κατηγορία (Temporal, Characters, Spatial, PAO, Verses).
   - Κάθε κουμπί έχει dropdown με τις υπο-βιβλιοθήκες (T1, T2, C2, S1, P1, P2, P3, V1).
   - Επιλογή υπο-βιβλιοθήκης → ανοίγει pop‑up/νέο tab με JSON preview.

5. **Δυναμική Ανίχνευση Βιβλιοθηκών**
   - Το script ανιχνεύει αυτόματα όλες τις υπο-βιβλιοθήκες από το JSON.
   - Νέες βιβλιοθήκες (π.χ. T3, C3, P4) εμφανίζονται αυτόματα στο UI.

6. **PAO Διαχωρισμός**
   - PAO 0–9 Table → αποκλειστικά LibraryP1.
   - PAO 00–99 Table → αποκλειστικά LibraryP2 ή LibraryP3 (επιλογή από dropdown).
   - Σαφής διάκριση: διαφορετικές βιβλιοθήκες για Persons / Actions / Objects ανά πίνακα.



## 📌 Έκδοση
**Markellos Chess Mnemonic System v.5.2**  
© Markellos Markides, 2025
