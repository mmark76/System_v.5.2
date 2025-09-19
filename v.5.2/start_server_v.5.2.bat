@echo off
echo Starting local server on http://localhost:8000 ...

:: Ξεκινά ο Python HTTP server
start "" python -m http.server 8000

:: Μικρή καθυστέρηση 2 δευτερόλεπτα
timeout /t 2 >nul

:: Άνοιγμα default browser στο αρχείο
start "" http://localhost:8000/Markellos_System.html
exit
