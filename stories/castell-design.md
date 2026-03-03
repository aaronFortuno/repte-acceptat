# DISSENY — "El Castell de les Mil Portes"

## CONCEPTE

La **Bruna**, aprenenta de cavalleresca de 2n any (amb assignatures pendents), rep l'encàrrec de rescatar el príncep Tomàs, empresonat a la torre més alta del Castell de les Mil Portes.
El castell és famós perquè cada porta, passadís i criatura planteja un enigma que sembla senzill però amaga un detall que cal llegir amb molta atenció.

**To**: Burleta i irònic com quest404, però amb una capa extra: el text enganya deliberadament.
Les opcions correctes requereixen haver entès bé el que diu el text narratiu. Les incorrectes són les que un lector distret triaria.

---

## MECÀNICA DE COMPRENSIÓ LECTORA

Cada node conté **un detall clau** al text narratiu que determina quina opció és correcta.
Tipus de trampa:

- **Negació amagada**: "La bruixa et diu que NO obris la porta blava" → obrir la blava és error
- **Detall específic**: "Cal despertar-lo suaument" → una opció el desperta, però violentament
- **Ordre invers**: "El primer que has de fer és l'últim que t'esperaries"
- **Doble sentit**: Una paraula que sembla dir una cosa però en context en diu una altra
- **Condició prèvia**: "Només podràs creuar si portes X" → has d'haver agafat X abans
- **Lògica implícita**: El text descriu una situació on la resposta lògica no és la més òbvia
- **Joc de paraules / homòfons**: "beure/veure", "son/són", "seu/seu", "val/vall", "net/net", "porta/porta" — paraules que sonen igual o similar però signifiquen coses molt diferents

---

## ESTRUCTURA DE L'ARBRE

```
                                    [node1] Entrada del castell
                                   /                           \
                              [node3]                        ☠️☠️ (F1, F2)
                           Jardí encantat
                            /          \
                       [node5]        ☠️☠️ (F3, F4)
                    Laberint de
                     bardisses
                    /    |     \
              [node6]  [BR-A]   ☠️ (F6)
            Sala dels  node14─node15─node16─node17 ──→ reconnecta a node6
             miralls         \       \       \
              /   \          ☠️☠️    ☠️☠️    ☠️☠️
         [node7]  ☠️☠️
       Biblioteca
        secreta
       /    |    \
  [node8] [BR-B]  ☠️
  Pont    node18─node19─node20─node21 ──→ reconnecta a node10
  fossat       \       \       \       \
    |          ☠️☠️    ☠️☠️    ☠️      ☠️☠️
 [node9]
 Cova drac
  /   |   \
[node10] ☠️  ☠️
Escales
torre
/    |    \
[node11] [BR-C]  ☠️
  Porta   node22─node23─node24 ──→ reconnecta a node9
encantada      \       \
  /   \        ☠️☠️    ☠️☠️
[node12]  ☠️☠️
Cel·la
príncep
/      \
[node13]  ☠️☠️
Fugida!
/     \
[final_bo] ☠️☠️
```

**Total: 25 nodes narratius + 35 finals (34 dolents + 1 bo)**

**Camí òptim (tronc principal)**: node1 → node3 → node5 → node6 → node7 → node8 → node9 → node10 → node11 → node12 → node13 → final_bo (11 passos)

**Branca A** (des de node5): node14 → node15 → node16 → node17 → reconnecta a node6 (4 nodes, pot reincorporar-se al tronc)
**Branca B** (des de node7): node18 → node19 → node20 → node21 → reconnecta a node10 (4 nodes, pot reincorporar-se al tronc)
**Branca C** (des de node10): node22 → node23 → node24 → reconnecta a node9 (3 nodes, torna enrere i ha de repetir)

---

## NODES DETALLATS — TRONC PRINCIPAL

---

### NODE 1 — L'Entrada del Castell

**Detall clau**: El cartell diu "Entrada PROHIBIDA per la porta principal. Useu l'entrada lateral."

> Ets la Bruna, aprenenta de cavalleresca amb dues assignatures suspeses (Lluita amb Llança II i Ètica de la Masmorra). T'han enviat a rescatar el príncep Tomàs del Castell de les Mil Portes. El castell és davant teu, enorme i una mica inclinat cap a l'esquerra, com si tingués ciàtica. A l'entrada principal hi ha un cartell enorme que diu: "PROHIBIT ENTRAR PER LA PORTA PRINCIPAL. Visitants i heroïnes: useu l'entrada del jardí lateral." Al costat de la porta hi ha un guàrdia de pedra que no es mou. Al jardí lateral, un caminet cobert de rosers.

- **A) Entrar per la porta principal ignorant el cartell** → **FINAL 1** ☠️
  *(Error: el cartell prohibeix explícitament la porta principal)*
- **B) Anar cap al jardí lateral, com indica el cartell** → **NODE 3**
  *(Correcta: segueix la instrucció del cartell)*
- **C) Escalar el mur pel costat esquerre per sorprendre el castell** → **FINAL 2** ☠️
  *(Error: el castell està inclinat cap a l'esquerra, el mur és inestable)*

---

### FINAL 1 — "Analfabetisme Funcional" ☠️

> Entres per la porta principal amb la confiança d'algú que no llegeix cartells. La porta resulta ser una trampa: el terra s'obre i caus en un tobogan que et porta directament a la sala de correus del castell, on acabes classificant cartes del rei durant 40 anys. El príncep Tomàs et fa arribar un postal cada Nadal: "Segueixo aquí dalt. Fa fred. Gràcies per res."
>
> "Analfabetisme Funcional" — El cartell era ben clar. Dues línies. Amb dibuixos.

---

### FINAL 2 — "Gravetat Selectiva" ☠️

> Intentes escalar el mur esquerre del castell. El mateix que està inclinat. Cap a tu. A mig camí, el mur decideix que ja n'hi ha prou d'estar inclinat i s'acaba de tombar. Tu quedes aplanada com una crep bretona. Un grup de turistes et fa fotos i et puntuen amb un 6.5 a TripAdvisor.
>
> "Gravetat Selectiva" — "Estructura interessant, però l'atracció dura molt poc." — Turista anònim.

---

### NODE 3 — El Jardí Encantat

**Detall clau**: Les flors que NO són vermelles són verinoses. Només les vermelles són segures.

> El jardí lateral és preciós, ple de flors de tots colors. Un rètol oxidat diu: "ATENCIÓ: Totes les flors d'aquest jardí són verinoses EXCEPTE les vermelles. No toqueu, no oloreu, no mireu fixament les que no siguin vermelles." Al mig del jardí hi ha tres camins: un envoltat de roses vermelles, un altre amb margarides grogues precioses, i un tercer amb unes violetes blaves que fan una olor increïble. Una abella et mira amb cara de pocs amics.

- **A) Agafar un ram de margarides grogues pel camí — són tan boniques!** → **FINAL 3** ☠️
  *(Error: les grogues són verinoses, només les vermelles són segures)*
- **B) Seguir el camí de roses vermelles sense tocar res més** → **NODE 5**
  *(Correcta: les vermelles són les úniques no verinoses)*
- **C) Olorar les violetes blaves — quina aroma!** → **FINAL 4** ☠️
  *(Error: el rètol diu explícitament "no oloreu" les no-vermelles)*

---

### FINAL 3 — "Floristeria Fatal" ☠️

> Agafes les margarides grogues perquè són molt boniques. El verí actua en 3 segons. Et converteixes en un test de flors amb potes. La part positiva: ets el test de flors més bonic del jardí. La part negativa: tot el demés.
>
> "Floristeria Fatal" — Ara ets una jardinera. Literalment.

---

### FINAL 4 — "Aroma Terapèutica" ☠️

> T'acostes a olorar les violetes blaves. L'aroma és tan intensa que et desmais a l'instant. Et despertes tres dies després convertida en un esquirol. L'abella, que resulta ser l'administradora del jardí, et cobra una multa de 300 monedes d'or per "ús indegut del nas en zona restringida". No tens butxaques. Ets un esquirol.
>
> "Aroma Terapèutica" — Les violetes estaven advertides. Tu no.

---

### NODE 5 — El Laberint de Bardisses

**Detall clau**: El ratolí diu que cal girar SEMPRE a la DRETA. No a l'esquerra ni recte.

> Seguint el camí de roses, arribes a un laberint de bardisses altíssimes. Un ratolí amb monòcle seu a l'entrada i et diu: "Escolta'm bé, heroïna: en aquest laberint has de girar SEMPRE a la dreta. Sempre. Cada encreuament: dreta. Si gires a l'esquerra, et perds per sempre. Si vas recte, acabes al menjador dels trolls, i avui tenen sopa de cavalleresca." Et fa una reverència elegant i desapareix dins un forat.

- **A) Seguir sempre la dreta, tal com ha dit el ratolí** → **NODE 6**
  *(Correcta: el ratolí ha estat clar i directe)*
- **B) Anar sempre a l'esquerra — el ratolí segur que mentia** → **NODE 14** (BRANCA A)
  *(Error parcial: no hi ha cap indicació que el ratolí mentís, però et perds i trobes una altra ruta)*
- **C) Tirar recte sempre — és el camí més lògic** → **FINAL 6** ☠️
  *(Error: el ratolí ha dit que recte porta als trolls)*

---

### FINAL 6 — "Sopa del Dia" ☠️

> Vas recte en cada encreuament. Al quart gir, arribes a una sala enorme amb una taula parada per a vint. Vint trolls. Et miren. Miren el menú. Et tornen a mirar. El menú diu "Sopa de cavalleresca amb crostons". Tu ets la cavalleresca. Els crostons ja hi són.
>
> "Sopa del Dia" — El ratolí t'ho havia dit. SOPA. DE. CAVALLERESCA.

---

### NODE 6 — La Sala dels Miralls

**Detall clau**: El mirall que mostra el que NO vols veure és l'únic que diu la VERITAT. Els que mostren imatges agradables menteixen.

> Gires a la dreta, a la dreta, i a la dreta, i surts del laberint a una sala plena de miralls. Una veu ressonant diu: "Tres miralls, tres portes. Dos miralls mostren el que vols veure. Un mirall mostra el que NO vols veure. Només el mirall que mostra el que no vols veure diu la veritat." El primer mirall et mostra victoriosa amb el príncep. El segon et mostra rica i famosa. El tercer et mostra un passadís fosc, fred i ple d'aranyes.

- **A) Travessar el primer mirall — et mostra victoriosa, és bon senyal!** → **FINAL 7** ☠️
  *(Error: mostra el que VOLS veure → menteix)*
- **B) Travessar el tercer mirall — és el que NO vols veure, per tant diu la veritat** → **NODE 7**
  *(Correcta: la veu ha dit que el que no vols veure és el verídic)*
- **C) Travessar el segon mirall — riquesa assegurada!** → **FINAL 7** ☠️
  *(Error: mostra el que VOLS veure → menteix)*

---

### FINAL 7 — "Reflex Equivocat" ☠️

> Travesses el mirall que et mostrava un futur ideal. L'ideal era la trampa. Caus en una dimensió paral·lela on tot és al revés: la gent camina cap enrere, els gats persegueixen els gossos, i les matemàtiques funcionen bé. Tries intentar sortir-ne, però la porta de tornada només s'obre els anys de traspàs. Que cauen en dimarts. De mesos que comencen per Q.
>
> "Reflex Equivocat" — El mirall no menteix, tu t'enganyes sola.

---

### NODE 7 — La Biblioteca Secreta

**Detall clau**: La nota diu que la clau és a la darrera pàgina del llibre MÉS PETIT, no el més gran.

> El passadís fosc et porta a una biblioteca secreta il·luminada per espelmes flotants. Hi ha tres llibres sobre un faristol: un llibre enorme titulat "Guia Completa del Castell (Volum I de XXVII)", un llibre mitjà titulat "Receptes de Cuina per a Dracs", i un llibre diminut, no més gran que un dit, titulat "Coses Importants". Una nota al faristol diu: "La clau que necessites és a la darrera pàgina del llibre més petit. No perdis el temps amb els grans, que pesen molt i no diuen res útil."

- **A) Obrir el llibre enorme — és el que tindrà més informació** → **FINAL 8** ☠️
  *(Error: la nota diu explícitament "el més petit" i "no perdis temps amb els grans")*
- **B) Consultar el llibre de receptes — pot ser útil per al drac** → **NODE 18** (BRANCA B)
  *(Desviat: no trobes la clau, però el llibre amaga una ruta alternativa per la cuina del castell)*
- **C) Obrir el llibre diminut "Coses Importants" per la darrera pàgina** → **NODE 8**
  *(Correcta: és el més petit i la nota ho diu clarament)*

---

### FINAL 8 — "Saviesa Inútil" ☠️

> Obres el llibre enorme. Pesa 40 quilos. Cau sobre teus peus. Mentre intentes alliberar-te, el llibre s'obre sol i comença a llegir-se en veu alta. Tot el volum I. De XXVII. Cada pàgina és un reglament sobre "Normativa d'Ús de Portes del Castell". Quan acaba el volum I, comença el II. No pots fugir. No pots aturar-lo. El príncep Tomàs celebra el seu 80è aniversari a la torre i et dedica un breu pensament.
>
> "Saviesa Inútil" — El volum XIV és sorprenentment entretingut. La resta, no.

---

### NODE 8 — El Pont sobre el Fossat

**Detall clau**: Cal creuar el pont SENSE mirar avall. El text ho diu explícitament.

> Trobes una clau daurada a la darrera pàgina del llibret. Bé! Un passadís t'obre camí fins a un pont de fusta vell que creua un fossat profundíssim. Una inscripció a l'inici del pont diu: "Creua sense mirar avall. El fossat et mostra la teva por més gran i et paralitza. Ulls endavant, passes fermes." El pont cruix. A sota, una boira verda i espessa es mou com si fos viva. Sents sorolls estranys que et criden pel teu nom.

- **A) Creuar mirant endavant, sense mirar avall, com diu la inscripció** → **NODE 9**
  *(Correcta: segueix la instrucció exacta)*
- **B) Mirar avall un moment — cal saber què hi ha per estar preparada** → **FINAL 9** ☠️
  *(Error: la inscripció diu explícitament que NO miris avall)*
- **C) Llançar una pedra al fossat per veure com de profund és** → **FINAL 9** ☠️
  *(Error: interactuar amb el fossat = acabar paralitzada pel que veus)*

---

### FINAL 9 — "Vertigen Existencial" ☠️

> Mires avall. Error. El fossat et mostra la teva por més gran: un examen sorpresa de Lluita amb Llança II. Amb exercicis de trigonometria. Et paralitzes al mig del pont. El pont, cansat de sostenir gent paralitzada, es trenca. Caus al fossat. La boira verda resulta ser un grup de fantasmes que fan un club de lectura. T'obliguen a llegir poesia del segle XII en veu alta. Cada dimarts. Per sempre.
>
> "Vertigen Existencial" — La trigonometria torna a guanyar.

---

### NODE 9 — La Cova del Drac

**Detall clau**: Cal despertar el drac SUAUMENT. Ni violentament ni deixar-lo dormir.

> Passes el pont amb els ulls endavant i arribes a una cova enorme on un drac gegant dorm sobre un munt de mitjons desaparellats (el veritable tresor perdut de la humanitat). Una placa a la paret diu: "Per accedir a l'escala de la torre, cal despertar el drac suaument. Si no el despertes, l'escala roman oculta. Si el despertes violentament, cremaran coses. Concretament, tu." El drac ronca. Cada ronc fa tremolar les parets. Tens a l'abast una ploma de paó reial, una trompeta de guerra, i una manta calenteta.

- **A) Passar de puntetes sense molestar-lo — millor no despertar el drac** → **FINAL 10** ☠️
  *(Error: cal despertar-lo, si no l'escala roman oculta)*
- **B) Fer-li pessigolles al nas amb la ploma de paó suaument** → **NODE 10**
  *(Correcta: el desperta suaument, com demana la placa)*
- **C) Tocar la trompeta de guerra a la seva orella — segur que es desperta!** → **FINAL 11** ☠️
  *(Error: és violent, la placa avisa que "cremaran coses, concretament tu")*

---

### FINAL 10 — "Passes de Puntetes cap al No-Res" ☠️

> Passes de puntetes com una professional del ballet. El drac segueix dormint. L'escala segueix oculta. Tu segueixes sense saber on anar. Fas 47 voltes a la cova buscant una sortida. Al cap de tres dies, el drac es desperta sol, et veu, i et pregunta si ets la nova assistent de neteja. Dius que sí. Ara neteges mitjons desaparellats professionalment.
>
> "Passes de Puntetes cap al No-Res" — La feina té bons horaris, però no hi ha festius.

---

### FINAL 11 — "Concert Cremós" ☠️

> Toques la trompeta de guerra amb tota la força dels teus pulmons. El drac obre els ulls d'un cop. No està content. De fet, la seva expressió és la mateixa que la d'algú a qui desperten un diumenge amb una trompeta. Crema tot el que veu. Tu inclosa. La trompeta es fon. El drac torna a dormir enfadat. La cova ara és 200 graus més calenta.
>
> "Concert Cremós" — Hauries d'haver llegit la placa. Deia "suaument". SUAUMENT.

---

### NODE 10 — Les Escales de la Torre

**Detall clau**: Cal pujar els graons de DOS en DOS (senars). Els parells tenen trampa.

> Li fas pessigolles amb la ploma i el drac esternuda suaument, obrint un ull. Et mira, somriu (un somriure de drac, que fa por igualment), i amb una urpa assenyala una escala de cargol que apareix a la paret. Abans d'adormir-se, murmura: "Puja els graons de dos en dos... els parells... són falsos..." I torna a roncar. L'escala és llarga i fosca. El primer graó sembla sòlid. El segon brilla una mica. El tercer sembla normal. El quart brilla com el segon.

- **A) Pujar ràpid, graó per graó, sense perdre temps** → **NODE 22** (BRANCA C)
  *(Error: trepitja un parell, cau, però sobreviu i pot tornar per un altre camí)*
- **B) Pujar saltant de dos en dos: primer, tercer, cinquè...** → **NODE 11**
  *(Correcta: saltar els parells, com ha dit el drac)*
- **C) Pujar només els graons que brillen — brillen per alguna raó** → **FINAL 12** ☠️
  *(Error: els que brillen són els parells, que són els falsos)*

---

### FINAL 12 — "Escala a la Carta" ☠️

> Tries pujar només pels graons brillants. El primer que trepitges, el segon, desapareix sota els teus peus. Rellisques per l'escala de cargol com per un tobogan, fent voltes i voltes fins que aterres al menjador dels trolls. Sí, els mateixos de la sopa de cavalleresca. Avui han canviat el menú. Ara fan estofat. Et miren. Miren l'olla. Et tornen a mirar.
>
> "Escala a la Carta" — Hauries d'haver escoltat el drac. De DOS en DOS.

---

### NODE 11 — La Porta Encantada

**Detall clau**: La porta demana que diguis el CONTRARI de la paraula màgica. "Obre't" no funciona, cal dir "Tanca't".

> Saltes els graons parells i arribes al cim de la torre. Una porta enorme i brillant et bloqueja el pas. Té una cara esculpida que obre els ulls quan t'acostes. La cara parla: "Soc la porta encantada. Per obrir-me, has de dir el CONTRARI del que vols que faci. Si vols que m'obri, no em diguis que m'obri. Molta gent s'equivoca aquí. MOLTA." La cara fa un somriure burleta i espera. La clau daurada del llibret encaixa al pany, però la porta no girarà sense la paraula correcta.

- **A) Dir "Obre't, porta!" amb veu potent i segura** → **FINAL 13** ☠️
  *(Error: ha dit que diguis el CONTRARI del que vols. Vols que s'obri → has de dir "tanca't")*
- **B) Dir "Tanca't!" — és el contrari d'obrir-se** → **NODE 12**
  *(Correcta: el contrari d'obrir és tancar, la porta s'obre)*
- **C) Dir "Sèsam!" — les portes màgiques sempre responen a això** → **FINAL 13** ☠️
  *(Error: la porta ha donat instruccions específiques, no és un conte de les mil i una nits)*

---

### FINAL 13 — "Lingüística de Combat" ☠️

> La porta et mira amb decepció. "T'ho acabo de dir. Literalment. Fa cinc segons. EL CONTRARI." La porta s'enfada i es tanca encara més fort. Tant que crea un efecte ventosa que t'enganxa a la fusta. Quedes enganxada a la porta com un imant a la nevera. El príncep Tomàs, des de l'altra banda, et sent i diu: "Una altra que no escolta. Tinc una col·lecció de 37 heroïnes enganxades a la porta. Benvinguda al club."
>
> "Lingüística de Combat" — La número 38. Heroïna enganxada. Literalment.

---

### NODE 12 — La Cel·la del Príncep

**Detall clau**: El príncep demana que TANQUIS la finestra (no que l'obris). El corrent d'aire és el que manté actiu l'encanteri.

> La porta s'obre. El príncep Tomàs és allà, assegut en una cadira llegint una revista de decoració d'interiors. Et mira: "Oh, per fi! Escolta, per trencar l'encanteri que em manté presoner, necessito que TANQUIS la finestra. Sí, ja sé que sembla absurd. Però el corrent d'aire de la finestra és el que alimenta la màgia de la cel·la. Sense corrent, sense màgia, sense presó. La finestra és allà." Assenyala una finestra oberta per on entra un vent gèlid.

- **A) Obrir la finestra encara més — necessita aire fresc, pobre!** → **FINAL 14** ☠️
  *(Error: ha dit TANCAR, no obrir. Obrir-la reforça l'encanteri)*
- **B) Tancar la finestra, tal com ha demanat** → **NODE 13**
  *(Correcta: ha dit TANCAR la finestra per trencar l'encanteri)*
- **C) Trencar la finestra a cops — problema resolt!** → **FINAL 14** ☠️
  *(Error: trencar-la no la tanca, el corrent d'aire continuaria entrant)*

---

### FINAL 14 — "Corrent Altern" ☠️

> El corrent d'aire s'intensifica. L'encanteri es reforça. La cel·la creix i es transforma en un apartament de dos dormitoris amb cuina americana. El príncep Tomàs sospira: "Bé, almenys ara tenim més espai." L'encanteri t'atrapa a tu també. Ara sou dos presoners. Amb cuina americana. Sense wifi. El príncep et passa la revista de decoració. "Pàgina 34, l'article sobre cortines és sorprenentment bo."
>
> "Corrent Altern" — Compartir pis amb un príncep no és tan glamurós com sembla.

---

### NODE 13 — La Fugida

**Detall clau**: Cal sortir per la porta per on has ENTRAT (no per la finestra, que ara és tancada, ni per un passadís desconegut).

> Tanques la finestra. L'encanteri es trenca amb un so de got de cristall que cau a terra. El príncep s'aixeca d'un bot: "Lliure! Som-hi, fugim!" Però aleshores sona l'alarma del castell. Totes les portes comencen a tancar-se. El príncep crida: "Hem de sortir per on has entrat tu! La porta de la torre! Les altres sortides són trampes per als que no recorden el camí d'entrada!" Tens tres opcions: la porta per on has entrat, un passadís secret que acaba d'aparèixer a la paret, i la finestra que acabes de tancar.

- **A) Llançar-vos per la finestra — és l'opció ràpida!** → **FINAL 15** ☠️
  *(Error: la finestra és a una torre altíssima, i a més l'has tancada)*
- **B) Sortir per la porta de la torre, per on has entrat** → **FINAL_BO** ✅
  *(Correcta: el príncep ha dit "per on has entrat tu")*
- **C) Entrar al passadís secret — els passadissos secrets sempre salven** → **FINAL 15** ☠️
  *(Error: el príncep ha dit que "les altres sortides són trampes")*

---

### FINAL 15 — "Sortida d'Emergència" ☠️

> Tries la sortida incorrecta. El passadís secret resulta ser un conducte de ventilació que et porta directament a la bugaderia del castell. Allà, un exèrcit d'escombres encantades us confonen amb roba bruta i us fiquen a la rentadora. Cicle llarg. Amb centrifugat. El príncep Tomàs, dins la rentadora, diu: "M'hauries d'haver escoltat." Té raó.
>
> "Sortida d'Emergència" — El centrifugat és el pitjor. Definitivament, el centrifugat.

---

### FINAL BO — "Heroïna de 2n Any (amb assignatures aprovades)" ✅

> Surts per la porta de la torre i baixes els graons de dos en dos (ja t'ho saps). Creueu el pont sense mirar avall, passeu per la biblioteca, travesseu el mirall correcte, sortiu del laberint girant a la dreta, i correu pel jardí de roses vermelles fins a la sortida. El castell es tanca darrere vostre amb un "CLONC" definitiu.
>
> El príncep Tomàs et mira: "Gràcies. Portava set anys allà dins. Ja m'havia llegit totes les revistes." Et dona un diploma oficial de cavalleresca que val per les dues assignatures pendents. Aproves el curs! La teva mare plora d'emoció (estava més preocupada pel curs que pel príncep).
>
> ★ VICTÒRIA! ★
> "Heroïna de 2n Any" — Primera aprenenta en rescatar un príncep llegint bé les instruccions.

---
---

## BRANCA A — "Perduda al Laberint" (des de node5)

Branca alternativa per als qui no confien en el ratolí. Travessen el laberint per l'esquerra i es perden, però troben una ruta diferent amb els seus propis reptes. Si superen els 4 nodes, es reincorporen al tronc principal a la Sala dels Miralls (node6).

---

### NODE 14 — La Clariana del Pou (BRANCA A — pas 1)

**Detall clau**: Joc de paraules **beure / veure**. El text diu que has de "VEURE el que amaga el pou", no "BEURE".

> Gires a l'esquerra al laberint i, com el ratolí havia dit, et perds. Camines hores fins que arribes a una clariana oculta al centre del laberint. Hi ha un pou de pedra antic amb una inscripció: "Per trobar la sortida del laberint, has de VEURE el que amaga el pou. Encara que tinguis molta set, no et deixis endur pel primer impuls." L'aigua del pou brilla d'una manera estranya. Al fons, sembla que hi ha alguna cosa reflectida. Al costat del pou hi ha un got de fusta.

- **A) Beure l'aigua del pou — tens molta set després de caminar tant** → **FINAL 16** ☠️
  *(Error: diu VEURE, no BEURE. I avisa de "no deixar-se endur pel primer impuls" → la set)*
- **B) Mirar dins el pou per VEURE què reflecteix l'aigua** → **NODE 15**
  *(Correcta: el text diu explícitament "VEURE el que amaga")*
- **C) Llançar el got dins el pou per veure com de profund és** → **FINAL 17** ☠️
  *(Error: el got podia ser útil, i llançar-lo no és VEURE el que amaga)*

---

### FINAL 16 — "Set Mortal" ☠️

> Beus l'aigua del pou. Tenia gust de llimona. Estrany. Molt estrany. Al cap de 5 segons, comences a encongir-te. Et fas petita, més petita, encara més petita. Ara ets de la mida d'una formiga. Les bardisses del laberint ara semblen seqüoies gegants. Una formiga de veritat et mira i diu: "Nova aquí? El sindicat d'insectes reuneix els dimecres." Deia VEURE, no BEURE. Una lletra de diferència. Una vida de diferència.
>
> "Set Mortal" — L'aigua tenia gust de llimona. El verí sempre en té.

---

### FINAL 17 — "Pou Sense Fons" ☠️

> Llances el got dins el pou. El so d'impacte mai arriba. El pou, ofès perquè li has llançat coses, et llança un raig d'aigua a la cara que et catapulta fora de la clariana i et torna al principi del laberint. Però ara l'entrada s'ha tancat. Les bardisses et miren. Jures que et miren. Una d'elles fa "psst". Vius la resta dels teus dies com a atracció turística del laberint.
>
> "Pou Sense Fons" — El pou tenia sentiments. No ho sabies.

---

### NODE 15 — El Mapa Submergit (BRANCA A — pas 2)

**Detall clau**: Joc de paraules **val / vall**. El mapa diu "segueix la vall", no "segueix el que val més".

> Mires dins el pou i a l'aigua hi veus reflectit un mapa! Mostra la clariana, el laberint, i una ruta de sortida. Al mapa hi ha escrit: "Segueix la VALL que trobaràs entre les bardisses altes. No segueixis el que creus que VAL més, segueix el que et porta avall." Efectivament, a un costat de la clariana, les bardisses baixen formant una petita vall natural. A l'altre costat, un camí puja cap amunt, on brilla una llum daurada molt atractiva.

- **A) Pujar cap a la llum daurada — el que val més sempre brilla!** → **FINAL 18** ☠️
  *(Error: el mapa diu "no segueixis el que creus que VAL més", segueix la VALL = avall)*
- **B) Baixar per la vall entre bardisses, com diu el mapa** → **NODE 16**
  *(Correcta: "segueix la VALL" i "el que et porta avall")*
- **C) Quedar-se a la clariana — si tens aigua i refugi, per què marxar?** → **FINAL 19** ☠️
  *(Error: no avances, i les bardisses tanquen la clariana de nit)*

---

### FINAL 18 — "Tot el que Brilla" ☠️

> Puges cap a la llum daurada. Resulta ser un grup de cuca de llucs gegants que fan una festa d'aniversari. No els agrada que apareguin desconeguts a les seves festes. Et fotografien amb les seves antenes bioluminiscents i et fan signar un document on acceptes ser la pallassa oficial del laberint durant 200 anys. El contracte inclou vacances. El 30 de febrer.
>
> "Tot el que Brilla" — El mapa deia VALL, no VAL. Una lletra. Un destí.

---

### FINAL 19 — "Zona de Confort" ☠️

> Decideixes quedar-te. Tens aigua, tens ombra, tens tranquil·litat. A la nit, les bardisses es mouen i tanquen la clariana completament. Ara tens un apartament de 2 metres quadrats sense finestres. El pou et passa factura per l'ús de l'aigua: 3 monedes d'or per litre. No tens monedes. Ni or. Ni butxaques amb capacitat suficient per afrontar aquesta situació.
>
> "Zona de Confort" — Confortable al principi. Menys confortable després.

---

### NODE 16 — El Guardià de Pedra (BRANCA A — pas 3)

**Detall clau**: Joc de paraules **son / són**. L'endevinalla pregunta "què SÓN" (verb ser), però la trampa és pensar en "SON" (dormir).

> Baixes per la vall i trobes una porta de pedra custodiada per una estàtua amb forma de gàrgola. Quan t'acostes, l'estàtua obre un ull i parla: "Una endevinalla per passar. Escolta bé: En aquest castell hi ha cent estàtues. De dia, les estàtues SÓN immòbils. De nit, algunes despertar-se del seu SON i caminen. Quantes estàtues SÓN immòbils de dia?" L'estàtua somriu. "No confonguis el que SÓN amb el que fan quan tenen SON."

- **A) "Cap! De nit tenen SON i es mouen, o sigui que de dia no SÓN realment immòbils"** → **FINAL 20** ☠️
  *(Error: la pregunta és quantes SÓN immòbils DE DIA, i de dia TOTES ho són)*
- **B) "Cent! De dia, TOTES les estàtues SÓN immòbils"** → **NODE 17**
  *(Correcta: de DIA totes SÓN immòbils, el que fan de nit no canvia la resposta de dia)*
- **C) "Algunes! Les que no tenen SON de nit deuen ser immòbils sempre"** → **FINAL 20** ☠️
  *(Error: barreja SON/SÓN; de dia TOTES són immòbils, independentment del que facin de nit)*

---

### FINAL 20 — "Confusió Gramatical" ☠️

> L'estàtua fa un sospir tan llarg que li surt pols pels narius. "SÓN, del verb SER. No SON, de DORMIR. DE DIA, totes SÓN immòbils. Cent. La resposta era cent." L'estàtua nega amb el cap i la porta es tanca. No només es tanca: desapareix. Ara tens una paret i un camí de tornada al laberint sense sortida. L'estàtua es torna a adormir i ronca. Irònicament, ara SÍ que té SON.
>
> "Confusió Gramatical" — SÓN i SON: dues lletres iguals, un accent de diferència, un futur molt diferent.

---

### NODE 17 — La Sortida del Laberint (BRANCA A — pas 4)

**Detall clau**: Joc de paraules **net / net**. Ha de deixar el passadís NET (endreçat), no buscar el NET (nét = descendent).

> "Cent! Correcte!" L'estàtua fa un aplaudiment de pedra (fa mal a les orelles) i la porta s'obre. Darrere hi ha un passadís curt que porta a una sala familiar: la Sala dels Miralls! Però el passadís està ple de trastos vells: armadures rovellades, escombres, teles d'aranya. Un rètol a l'entrada del passadís diu: "Abans de sortir, deixa el passadís NET. Recull els trastos i fes-lo transitable. Si deixes el passadís brut, la porta de sortida es tancarà."

- **A) Endreçar el passadís recollint trastos i fent-lo NET (endreçat)** → **NODE 6** ✓ (RECONNECTA al tronc!)
  *(Correcta: NET = endreçat, net de brutícia. Ha de netejar el passadís)*
- **B) Buscar el NET (nét) del guardià per preguntar-li com sortir** → **FINAL 21** ☠️
  *(Error: NET aquí vol dir endreçat/net, no nét=descendent. A més, no hi ha cap nét)*
- **C) Passar ràpid pel passadís sense tocar res — els trastos no són teus** → **FINAL 21** ☠️
  *(Error: el rètol diu que cal deixar-lo net, si no la porta es tanca)*

---

### FINAL 21 — "Neteja Pendent" ☠️

> No neteges el passadís. La porta de la Sala dels Miralls es tanca amb un "CLAP" davant del teu nas. El rètol canvia de text: "T'ho havia dit. NET. Endreçat. Recollit. Escombrat. No era tan difícil." Intentes tornar enrere, però la porta del guardià també s'ha tancat. Estàs atrapada al passadís brut amb una armadura rovellada que, per cert, acaba de moure el braç. Oh.
>
> "Neteja Pendent" — NET: de netejar. N-E-T. Era literal.

---
---

## BRANCA B — "La Cuina del Drac" (des de node7)

Branca alternativa per als qui trien el llibre de receptes. El llibre revela un passadís secret cap a la cuina del castell, on hauran de cuinar per superar els reptes. Si superen els 4 nodes, arriben directament a les escales de la torre (node10) per una ruta alternativa, però sense la clau daurada (no la necessitaran per aquesta via).

---

### NODE 18 — El Passadís de la Cuina (BRANCA B — pas 1)

**Detall clau**: Joc de paraules **porta / porta**. "La porta que PORTA al camí correcte" = la porta que et condueix, no la porta que carrega coses.

> Obres el llibre de receptes i, entre una recepta de "Sopa de Cavalleresca" i una altra de "Pastís de Bruixa", trobes un mapa del castell amb un passadís secret cap a la cuina. Segueixes el mapa i arribes a un vestíbul amb tres portes. Cada porta té un rètol. La primera diu: "Jo porto plats bruts". La segona diu: "Jo porto a la cuina". La tercera diu: "Jo porto coberts d'or". Un cartell al sostre diu: "Tria la porta que PORTA al camí correcte. Les que PORTEN objectes no porten enlloc."

- **A) La primera porta — porta plats, o sigui que ve de la cuina!** → **FINAL 22** ☠️
  *(Error: "porto plats bruts" = carrega plats. Les que PORTEN objectes no porten enlloc)*
- **B) La segona porta — "porto a la cuina" = et condueix a la cuina** → **NODE 19**
  *(Correcta: "porto A la cuina" = condueix, no carrega. És l'únic PORTA que significa "conduir")*
- **C) La tercera porta — coberts d'or sona molt bé!** → **FINAL 22** ☠️
  *(Error: "porto coberts d'or" = carrega objectes. Les que PORTEN objectes no porten enlloc)*

---

### FINAL 22 — "Transport Equivocat" ☠️

> Obres la porta que porta objectes. Efectivament, la porta porta coses: comença a llançar-te plats (o coberts d'or, segons quina hagis triat) a una velocitat alarmant. No és una porta, és una catapulta. Els plats impacten amb una precisió que el departament d'artilleria del castell envejaria. Acabes al terra, coberta de porcellana trencada (o coberts daurats), mentre la porta es tanca satisfeta.
>
> "Transport Equivocat" — PORTAR: conduir o carregar. Una lletra no, però un significat sí.

---

### NODE 19 — La Cuina del Goblin (BRANCA B — pas 2)

**Detall clau**: Joc de paraules **cou / cou**. El goblin pregunta "què et COU?" (què et molesta/preocupa), no "què COU al foc?".

> La porta et porta (et condueix!) a una cuina enorme. Foc, olles, vapors. Un goblin amb barret de xef et mira des de darrere d'un taulell. "Ah, una visitant! Abans de deixar-te passar, contesta'm una cosa: QUÈ ET COU?" El goblin somriu. Darrere seu, hi ha tres olles al foc que bullen. Al taulell hi ha un rètol que diu: "En aquesta cuina, les paraules tenen el significat que el cuiner els dóna. I el cuiner vol saber què et PREOCUPA, no què es CUINA."

- **A) "El que cou a l'olla gran és sopa de ceba!"** → **FINAL 23** ☠️
  *(Error: el goblin pregunta què et COU = preocupa, no què COU al foc. El rètol ho explica)*
- **B) "El que em cou és que no trobo la clau per a la torre!"** → **NODE 20**
  *(Correcta: COU = preocupa/molesta. Li expliques la teva preocupació real)*
- **C) "No ho sé, no veig què hi ha dins les olles des d'aquí"** → **FINAL 23** ☠️
  *(Error: segueix pensant en coure=cuinar, no en coure=molestar/preocupar)*

---

### FINAL 23 — "Cuiner Decebut" ☠️

> El goblin deixa caure la cullera de fusta amb decepció. "COU. Què-et-COU. Què et PREOCUPA. Què et MOLESTA. No què es cuina al foc!" El goblin s'enfada i et posa a pelar patates. Són 800 quilos de patates. Quan acabes, et posa a pelar cebes. Quan acabes les cebes, tornes a les patates. El príncep Tomàs, des de la torre, nota una olor a patata fregida que dura mesos.
>
> "Cuiner Decebut" — COU: verb COURE, sentit figurat. Busca-ho al diccionari. Ah, espera, no pots: estàs pelant patates.

---

### NODE 20 — La Recepta Exacta (BRANCA B — pas 3)

**Detall clau**: Comprensió lectora clàssica. La recepta diu TRES gotes de llimona, NO "un raig", i s'ha de remenar cap a l'ESQUERRA, no la dreta.

> "Molt bé! Doncs ajuda'm amb això i et deixaré passar." El goblin et dona una recepta per a una poció de son que pot adormir el drac i fer aparèixer l'escala sense haver-lo de despertar. La recepta diu clarament: "Afegir EXACTAMENT tres gotes de suc de llimona (ni una més, ni una menys). Remenar cap a l'ESQUERRA set vegades. Servir calent." El goblin et deixa davant l'olla amb els ingredients i se'n va a fumar.

- **A) Posar un bon raig de llimona (tres gotes no es notaran!) i remenar a la dreta** → **FINAL 24** ☠️
  *(Error doble: EXACTAMENT tres gotes, i cap a l'ESQUERRA)*
- **B) Posar exactament tres gotes de llimona i remenar a l'esquerra set vegades** → **NODE 21**
  *(Correcta: segueix la recepta al peu de la lletra)*
- **C) Posar tres gotes de llimona i remenar a la dreta — l'esquerra porta mala sort!** → **FINAL 24** ☠️
  *(Error: la recepta diu ESQUERRA, les supersticions no compten)*

---

### FINAL 24 — "Poció Fallida" ☠️

> La poció explota. No en sentit figurat: l'olla fa un "BOOM" que s'escolta fins a la torre del príncep. El goblin torna corrents, et veu coberta de poció verda fluorescent, i es posa a plorar: "ERA L'ÚLTIMA OLLA DE COURE ARTESANAL DEL CASTELL! SAPS QUANT COSTA UNA OLLA ARTESANAL?" Et fa pagar l'olla. Treballant a la cuina. Fins al 2087. La recepta deia tres gotes i esquerra. TRES. ESQUERRA.
>
> "Poció Fallida" — La recepta era clara. Tu no.

---

### NODE 21 — El Camí de la Cuina a la Torre (BRANCA B — pas 4)

**Detall clau**: Joc de paraules **seu / seu**. "Seu a la SEU" pot significar "asseu-te a la cadira" o "la seu del bisbe/catedral". El text especifica que "seu" és el verb SEURE.

> La poció és perfecta. El goblin la posa en una ampolla i te la dona: "Vés per aquell passadís de servei. Porta directament a la cova del drac. Aboca la poció al seu nas i l'escala apareixerà. Però alerta: al passadís trobaràs una sala amb una cadira. Un rètol diu 'SEU a la SEU'. No et confonguis: SEU vol dir ASSEU-TE, és el verb SEURE. La SEU és la cadira. No busquis cap catedral." El passadís és fosc. Arribes a una sala amb una cadira de fusta.

- **A) Seure a la cadira, com diu el rètol (SEU = verb seure)** → **NODE 10** ✓ (RECONNECTA al tronc!)
  *(Correcta: SEU = asseu-te. La cadira activa un mecanisme que t'envia a la cova del drac, on aboques la poció i l'escala apareix. Arribes a node10: Les Escales de la Torre)*
- **B) Buscar la SEU (catedral) per algun passadís lateral** → **FINAL 25** ☠️
  *(Error: el goblin ha dit explícitament "no busquis cap catedral", SEU = verb seure)*
- **C) Ignorar la cadira i seguir pel passadís — les cadires en masmorres mai són bones** → **FINAL 25** ☠️
  *(Error: el rètol i el goblin diuen que cal seure. Ignorar-ho tanca el passadís)*

---

### FINAL 25 — "Cadira Buida" ☠️

> No seus a la cadira. El passadís es tanca. La cadira et mira (sí, la cadira té ulls, és un castell encantat) i diu: "Tothom busca la catedral. Jo soc una cadira. El verb era SEURE. S-E-U-R-E. Asseure's. Cul a la fusta. Era així de simple." La cadira tanca els ulls. Tu quedes al passadís. Sense sortida. Sense cadira que et vulgui parlar. Sola amb la teva confusió lingüística.
>
> "Cadira Buida" — SEU: de seure. No de catedral. El goblin T'HO HAVIA DIT.

---
---

## BRANCA C — "Les Catacumbes" (des de node10)

Branca per als qui pugen l'escala graó a graó sense saltar. Cauen pels graons falsos però sobreviuen a un nivell inferior del castell. Després de 3 nodes, tornen a la cova del drac (node9) i han de repetir la interacció amb el drac per accedir de nou a l'escala.

---

### NODE 22 — La Sala de les Armadures (BRANCA C — pas 1)

**Detall clau**: Joc de paraules **pas / pas**. "Fes un PAS endavant" vol dir fer un pas (caminar), no PAS "no facis res" (pas = negació en català).

> Trepitges el segon graó. Desapareix. Caus per un tobogan que et porta a una sala subterrània plena d'armadures buides col·locades en fila. No t'has fet mal gràcies a un munt de palla al final del tobogan (algú ja preveia que algú cauria). Un cartell a la paret diu: "Per trobar la sortida, fes un PAS endavant. PAS vol dir CAMINAR, no pas 'no fer res'. Vigila amb les negacions!" Davant teu hi ha tres files d'armadures: una fila al centre, una a l'esquerra i una a la dreta.

- **A) Quedar-se quiet i no fer PAS res — "pas" vol dir "no", oi?** → **FINAL 26** ☠️
  *(Error: el cartell avisa exactament d'això! PAS aquí = caminar, no la negació)*
- **B) Fer un pas endavant, caminant pel centre de la sala** → **NODE 23**
  *(Correcta: PAS = un pas caminant, com diu el cartell)*
- **C) Córrer cap a la sortida que es veu al fons — per què caminar si pots córrer?** → **FINAL 27** ☠️
  *(Error: diu "un PAS", no "córrer". Les armadures reaccionen al moviment ràpid)*

---

### FINAL 26 — "Negació Fatal" ☠️

> Et quedes plantada sense moure't. "Pas" com a negació. No fer res. El cartell havia dit EXACTAMENT que "pas" aquí vol dir CAMINAR. Ho havia dit. Amb lletres grans. Mentre esperes, les armadures comencen a moure's. Resulta que s'activen quan detecten inactivitat. T'envolten. Et nomenen capitana del seu regiment. Ara ets una comandant d'armadures buides. Desfiles cada dia a les 7 del matí. No tens vacances.
>
> "Negació Fatal" — PAS: de caminar. Com anar d'un lloc a un altre. Amb els peus.

---

### FINAL 27 — "Velocitat Excessiva" ☠️

> Surts corrents com una bala. Les armadures, que tenen sensors de moviment medievals (cadenes molt sensibles), s'activen totes alhora. Són 40 armadures contra tu. La persecució dura exactament 12 segons perquè ensopegues amb un elm que hi havia al terra. Les armadures et capturen i et posen dins d'una d'elles. Ara ets una armadura. Fas *clang clang* quan camines.
>
> "Velocitat Excessiva" — Deia PAS. Un pas. Lent. Tranquil. No un sprint olímpic.

---

### NODE 23 — La Font dels Desitjos (BRANCA C — pas 2)

**Detall clau**: Joc de paraules **ral / real**. La font demana una moneda de RAL (moneda antiga), no una moneda REAL (de veritat). La trampa és que "real" pot voler dir "autèntica" o referir-se al "ral", moneda antiga.

> Fas un pas endavant. Les armadures s'aparten educadament (una fins i tot et fa una reverència). Arribes a una sala amb una font al centre. Un rètol diu: "Llança una moneda per obrir la porta. Però atenció: no serveix qualsevol moneda. Necessito una moneda d'un RAL. Un RAL, de les monedes antigues. No em llancis qualsevol moneda que trobis només perquè sigui REAL (autèntica). Vull un RAL." Al terra hi ha tres monedes: una moneda d'or brillant (real, autèntica), una moneda de xocolata (falsa), i una moneda vella i oxidada amb la inscripció "1 RAL".

- **A) Llançar la moneda d'or — és la més real (autèntica) de totes!** → **FINAL 28** ☠️
  *(Error: la font demana un RAL, no una moneda "real"/autèntica)*
- **B) Llançar la moneda vella amb la inscripció "1 RAL"** → **NODE 24**
  *(Correcta: és la moneda d'un RAL que demana la font)*
- **C) Llançar la moneda de xocolata — les fonts accepten qualsevol cosa** → **FINAL 28** ☠️
  *(Error: la font diu que no serveix qualsevol moneda)*

---

### FINAL 28 — "Moneda Equivocada" ☠️

> Llances la moneda incorrecta. La font escup l'aigua amb tanta força que et torna a llançar pel tobogan. Però aquest cop, el tobogan s'ha reconfigurar i et porta a la cuina dels trolls. Sí, els de la sopa de cavalleresca. Ja es coneixen. Ja tenen el plat preparat. Et saluden pel nom. Això és inquietant.
>
> "Moneda Equivocada" — RAL: moneda antiga. REAL: autèntica. No és el mateix.

---

### NODE 24 — El Passadís del Retorn (BRANCA C — pas 3)

**Detall clau**: Joc de paraules **deu / Déu**. "Compta fins a DEU" vol dir fins al número 10, no "resa a DÉU".

> La font accepta el ral i s'obre una porta. Arribes a un passadís ascendent que sembla tornar cap als pisos superiors del castell. Un cartell al passadís diu: "Per obrir la porta del final, compta fins a DEU en veu alta. DEU, el número. Deu. 10. El que va després del nou. No facis res més que comptar." La porta del final del passadís té un comptador gravat que espera el número correcte. Al costat de la porta hi ha un reclinatori antic (un moble per agenollar-se i resar).

- **A) Agenollar-se al reclinatori i resar a DÉU — mai no se sap** → **FINAL 29** ☠️
  *(Error: DEU el número, no DÉU divinitat. El cartell ho especifica amb insistència)*
- **B) Comptar en veu alta: "u, dos, tres... deu!" fins al número 10** → **NODE 9** ✓ (RECONNECTA al tronc!)
  *(Correcta: compta fins a DEU = 10. La porta s'obre i arribes de nou a la cova del drac)*
- **C) Comptar fins a mil — si deu és bo, mil serà millor!** → **FINAL 29** ☠️
  *(Error: diu fins a DEU, no més. "No facis res més que comptar" fins a deu)*

---

### FINAL 29 — "Confusió Espiritual" ☠️

> El comptador de la porta espera un número. Tu li dones oracions (o números equivocats). La porta no s'obre. El comptador es posa a zero i mostra un missatge: "DEU. EL NÚMERO. 10. DESPRÉS DEL 9. ABANS DE l'11. NO ÉS TAN DIFÍCIL." El passadís comença a encongir-se. Et quedes en un espai cada cop més petit. Acabes fent amistat amb un ratolí que viu allà dins. Es diu Jordi. No és tan mal company.
>
> "Confusió Espiritual" — DEU: 10. Un número. Amb un accent seria DÉU, però no en tenia.

---
---

## RESUM DE FINALS

| #      | Nom                    | Node   | Trampa de comprensió                                                |
| ------ | ---------------------- | ------ | ------------------------------------------------------------------- |
| ☠️ F1  | Analfabetisme Funcional | node1  | Ignora cartell "PROHIBIT porta principal"                          |
| ☠️ F2  | Gravetat Selectiva     | node1  | Escala mur inclinat (mencionat al text)                             |
| ☠️ F3  | Floristeria Fatal      | node3  | Agafa flors NO vermelles (text diu "excepte vermelles")             |
| ☠️ F4  | Aroma Terapèutica      | node3  | Olora flors prohibides ("no oloreu")                                |
| ☠️ F6  | Sopa del Dia           | node5  | Va recte quan el ratolí ha dit "dreta"                              |
| ☠️ F7  | Reflex Equivocat       | node6  | Tria mirall agradable (text diu "el NO agradable = veritat")        |
| ☠️ F8  | Saviesa Inútil         | node7  | Obre llibre gran (nota diu "el més petit")                          |
| ☠️ F9  | Vertigen Existencial   | node8  | Mira avall (inscripció diu "SENSE mirar avall")                     |
| ☠️ F10 | Passes de Puntetes     | node9  | No desperta el drac (cal despertar-lo "suaument")                   |
| ☠️ F11 | Concert Cremós         | node9  | Desperta drac violentament (la placa diu "suaument")                |
| ☠️ F12 | Escala a la Carta      | node10 | Puja pels graons brillants = parells = falsos                       |
| ☠️ F13 | Lingüística de Combat  | node11 | Diu "obre't" (porta diu "el CONTRARI del que vols")                 |
| ☠️ F14 | Corrent Altern         | node12 | Obre/trenca finestra (príncep diu "TANCA")                          |
| ☠️ F15 | Sortida d'Emergència   | node13 | No surt per on ha entrat (príncep ho diu)                           |
| ☠️ F16 | Set Mortal             | node14 | Confon BEURE amb VEURE                                              |
| ☠️ F17 | Pou Sense Fons         | node14 | Llança el got al pou en lloc de VEURE-hi dins                       |
| ☠️ F18 | Tot el que Brilla      | node15 | Segueix "el que VAL" en lloc de "la VALL"                           |
| ☠️ F19 | Zona de Confort        | node15 | Es queda a la clariana sense avançar                                |
| ☠️ F20 | Confusió Gramatical    | node16 | Confon SÓN (ser) amb SON (dormir)                                   |
| ☠️ F21 | Neteja Pendent         | node17 | Confon NET (endreçat) amb NET (nét/descendent) o ignora el rètol    |
| ☠️ F22 | Transport Equivocat    | node18 | Confon PORTA (conduir) amb PORTA (carregar objectes)                |
| ☠️ F23 | Cuiner Decebut         | node19 | Confon COU (preocupar) amb COU (cuinar)                            |
| ☠️ F24 | Poció Fallida          | node20 | No segueix la recepta (3 gotes, esquerra)                           |
| ☠️ F25 | Cadira Buida           | node21 | Confon SEU (seure) amb SEU (catedral) o ignora la cadira            |
| ☠️ F26 | Negació Fatal          | node22 | Confon PAS (caminar) amb PAS (negació)                              |
| ☠️ F27 | Velocitat Excessiva    | node22 | Corre en lloc de fer UN PAS                                         |
| ☠️ F28 | Moneda Equivocada      | node23 | Confon RAL (moneda) amb REAL (autèntica)                            |
| ☠️ F29 | Confusió Espiritual    | node24 | Confon DEU (número 10) amb DÉU (divinitat)                         |
| ✅      | Heroïna de 2n Any      | node13 | Surt per la porta d'entrada ✓                                       |

---

## ESTADÍSTIQUES

- **Nodes narratius**: 25 (13 tronc + 4 branca A + 4 branca B + 3 branca C + 1 reconnexió)
- **Finals**: 30 (29 dolents + 1 bo)
- **Camí òptim (tronc)**: 11 decisions correctes seguides
- **Camí amb branca A**: 15 decisions (4 extra al laberint + reconnecta a node6)
- **Camí amb branca B**: 15 decisions (4 extra per la cuina + reconnecta a node10)
- **Camí amb branca C**: 14 decisions (3 extra per les catacumbes + torna a node9 i ha de repetir)
- **Llargada textos**: ~60-120 paraules per node (aprox. el doble de quest404)
- **Cada node té exactament 1 detall clau** que determina l'opció correcta
- **Tronc principal**: trampes de comprensió lectora (negacions, detalls, lògica inversa)
- **Branques**: jocs de paraules homòfons (beure/veure, val/vall, son/són, net/net, porta/porta, cou/cou, seu/seu, pas/pas, ral/real, deu/Déu)
- **Reconnexions**: les 3 branques tornen al tronc principal, permetent completar l'aventura

---

## MAPA DE CONNEXIONS

```
Tronc:   node1 → node3 → node5 → node6 → node7 → node8 → node9 → node10 → node11 → node12 → node13 → FINAL_BO

Branca A: node5 →(esquerra)→ node14 → node15 → node16 → node17 → node6 (reconnecta)
Branca B: node7 →(receptes)→ node18 → node19 → node20 → node21 → node10 (reconnecta)
Branca C: node10 →(graó a graó)→ node22 → node23 → node24 → node9 (torna enrere!)
```

**Nota sobre Branca C**: El jugador que cau per l'escala acaba tornant a la cova del drac (node9). Ha de repetir la interacció amb el drac i l'escala, però ara ja sap que ha de saltar de dos en dos. Això crea una sensació de "circular" que penalitza l'error sense matar el personatge.
