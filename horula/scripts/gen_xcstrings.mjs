// Builds apple/Shared/Localizable.xcstrings from the web's lang/*.js tables, so the native app speaks the same
// twelve languages. Run after changing any lang file: node scripts/gen_xcstrings.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('..', import.meta.url).pathname, ctx = { self: {} };
const langs = readdirSync(root + 'lang').map(f => f.replace('.js', '')).sort();
for (const l of langs) vm.runInNewContext(readFileSync(`${root}lang/${l}.js`, 'utf8'), ctx);
const T = ctx.self.LANG_TEXT;
// Strings only the native app shows: [fr, es, de, ja, zh, pt, ko, it, nl, ar, hi].
const NATIVE = {
  'Add City': ['Ajouter une ville', 'Añadir ciudad', 'Stadt hinzufügen', '都市を追加', '添加城市', 'Adicionar cidade', '도시 추가', 'Aggiungi città', 'Voeg stad toe', 'إضافة مدينة', 'शहर जोड़ें'],
  'Alarms are turned off for Horula in Settings, so they cannot ring.': ['Les alarmes de Horula sont désactivées dans Réglages, elles ne peuvent donc pas sonner.', 'Las alarmas de Horula están desactivadas en Ajustes, así que no pueden sonar.', 'Wecker für Horula sind in den Einstellungen aus und können nicht klingeln.', '設定でHorulaのアラームがオフになっているため、鳴りません。', 'Horula 的闹钟已在设置中关闭，因此无法响铃。', 'Os alarmes do Horula estão desativados em Ajustes, então não podem tocar.', '설정에서 Horula 알람이 꺼져 있어 울릴 수 없습니다.', 'Le sveglie di Horula sono disattivate in Impostazioni, quindi non possono suonare.', 'Wekkers voor Horula staan uit in Instellingen, dus ze kunnen niet afgaan.', 'منبهات Horula متوقفة في الإعدادات، لذا لا يمكنها أن ترن.', 'सेटिंग्स में Horula के अलार्म बंद हैं, इसलिए वे बज नहीं सकते।'],
  'Add 1 minute': ['Ajouter 1 minute', 'Añadir 1 minuto', '1 Minute hinzufügen', '1分追加', '加 1 分钟', 'Adicionar 1 minuto', '1분 추가', 'Aggiungi 1 minuto', 'Voeg 1 minuut toe', 'إضافة دقيقة', '1 मिनट जोड़ें'],
  'Back to now': ['Revenir à maintenant', 'Volver a ahora', 'Zurück zu jetzt', '現在に戻る', '回到现在', 'Voltar para agora', '지금으로 돌아가기', 'Torna a ora', 'Terug naar nu', 'العودة إلى الآن', 'अभी पर लौटें'],
  'Choose a City': ['Choisir une ville', 'Elige una ciudad', 'Stadt wählen', '都市を選択', '选择城市', 'Escolha uma cidade', '도시 선택', 'Scegli una città', 'Kies een stad', 'اختر مدينة', 'शहर चुनें'],
  'Export Backup': ['Exporter la sauvegarde', 'Exportar copia', 'Backup exportieren', 'バックアップを書き出す', '导出备份', 'Exportar backup', '백업 내보내기', 'Esporta backup', 'Exporteer back-up', 'تصدير النسخة الاحتياطية', 'बैकअप एक्सपोर्ट करें'],
  'Import Backup': ['Importer une sauvegarde', 'Importar copia', 'Backup importieren', 'バックアップを読み込む', '导入备份', 'Importar backup', '백업 가져오기', 'Importa backup', 'Importeer back-up', 'استيراد نسخة احتياطية', 'बैकअप इम्पोर्ट करें'],
  'No alarms. Tap + to add one.': ['Aucune alarme. Touchez + pour en ajouter.', 'No hay alarmas. Toca + para añadir una.', 'Keine Wecker. Tippe auf +, um einen hinzuzufügen.', 'アラームはありません。+をタップして追加します。', '没有闹钟。轻点 + 添加。', 'Nenhum alarme. Toque em + para adicionar.', '알람이 없습니다. +를 탭해 추가하세요.', 'Nessuna sveglia. Tocca + per aggiungerne una.', 'Geen wekkers. Tik op + om er een toe te voegen.', 'لا منبهات. انقر + لإضافة منبه.', 'कोई अलार्म नहीं। जोड़ने के लिए + पर टैप करें।'],
  'One file with your alarms, cities and timers. Works with Horula on the web too.': ['Un fichier avec vos alarmes, villes et minuteurs. Fonctionne aussi avec Horula sur le web.', 'Un archivo con tus alarmas, ciudades y temporizadores. También funciona con Horula en la web.', 'Eine Datei mit deinen Weckern, Städten und Timern. Funktioniert auch mit Horula im Web.', 'アラーム、都市、タイマーを1つのファイルに。Web版のHorulaでも使えます。', '一个文件包含你的闹钟、城市和计时器，也适用于网页版 Horula。', 'Um arquivo com seus alarmes, cidades e timers. Funciona também com o Horula na web.', '알람, 도시, 타이머를 파일 하나로. 웹의 Horula에서도 됩니다.', 'Un file con sveglie, città e timer. Funziona anche con Horula sul web.', 'Eén bestand met je wekkers, steden en timers. Werkt ook met Horula op het web.', 'ملف واحد بمنبهاتك ومدنك ومؤقتاتك. يعمل مع Horula على الويب أيضًا.', 'आपके अलार्म, शहर और टाइमर एक फ़ाइल में। वेब पर Horula के साथ भी चलती है।'],
  'Custom': ['Personnalisé', 'Personalizado', 'Eigene', 'カスタム', '自定', 'Personalizado', '사용자 지정', 'Personalizzato', 'Aangepast', 'مخصص', 'कस्टम'],
  'Time': ['Heure', 'Hora', 'Uhrzeit', '時刻', '时间', 'Hora', '시간', 'Ora', 'Tijd', 'الوقت', 'समय'],
  'Next Alarm': ['Prochaine alarme', 'Próxima alarma', 'Nächster Wecker', '次のアラーム', '下一个闹钟', 'Próximo alarme', '다음 알람', 'Prossima sveglia', 'Volgende wekker', 'المنبه التالي', 'अगला अलार्म'],
  'The time in your cities, and whether the sun is up there.': ['L’heure dans vos villes, et si le soleil y est levé.', 'La hora en tus ciudades y si allí es de día.', 'Die Uhrzeit in deinen Städten und ob dort die Sonne scheint.', 'あなたの都市の時刻と、そこが昼かどうか。', '你的城市的时间，以及那里是否是白天。', 'A hora nas suas cidades e se o sol está de pé lá.', '내 도시의 시간과 그곳이 낮인지 여부.', 'L’ora nelle tue città e se lì c’è il sole.', 'De tijd in je steden en of de zon daar op is.', 'الوقت في مدنك وهل الشمس مشرقة هناك.', 'आपके शहरों का समय, और वहां दिन है या नहीं।'],
  'When your next alarm rings.': ['Quand sonne votre prochaine alarme.', 'Cuándo suena tu próxima alarma.', 'Wann dein nächster Wecker klingelt.', '次のアラームが鳴る時刻。', '下一个闹钟何时响。', 'Quando seu próximo alarme toca.', '다음 알람이 울리는 시간.', 'Quando suona la prossima sveglia.', 'Wanneer je volgende wekker afgaat.', 'متى يرن منبهك التالي.', 'आपका अगला अलार्म कब बजेगा।'],
  '%lld hr %lld min of sleep': ['%1$lld h %2$lld min de sommeil', '%1$lld h %2$lld min de sueño', '%1$lld Std. %2$lld Min. Schlaf', '睡眠%1$lld時間%2$lld分', '睡眠 %1$lld 小时 %2$lld 分钟', '%1$lld h %2$lld min de sono', '수면 %1$lld시간 %2$lld분', '%1$lld h %2$lld min di sonno', '%1$lld u %2$lld min slaap', '%1$lld س %2$lld د من النوم', '%1$lld घं %2$lld मि की नींद'],
};
// Web templates as Swift interpolation keys: {n} becomes a positional %n$@ or %n$lld.
const TEMPLATES = { 'Next alarm %@': ['Next alarm {0}', '@'], '%@ Morning': ['{0} Morning', '@'], 'Ends %@': ['Ends {0}', '@'], '%lld of %lld': ['{0} of {1}', 'lld lld'],
  '%lld rounds': ['{0} rounds', 'lld'], '%@ ago': ['{0} ago', '@'], 'Up next: %@': ['Up next: {0}', '@'], 'Rings again at %@': ['Rings again at {0}', '@'], 'Skipping %@': ['Skipping {0}', '@'], 'Restored %lld alarms and %lld cities': ['Restored {0} alarms and {1} cities', 'lld lld'] };
const strings = {};
// Apple's codes: the Chinese here is simplified and the Portuguese Brazilian.
const APPLE = { zh: 'zh-Hans', pt: 'pt-BR' };
const add = (key, per) => { strings[key] = { localizations: Object.fromEntries(langs.map(l => [APPLE[l] || l, { stringUnit: { state: 'translated', value: per(l) } }])) }; };
for (const k of Object.keys(T.fr)) if (!/\{\d\}/.test(k)) add(k, l => T[l][k]);
for (const [k, v] of Object.entries(NATIVE)) add(k, l => v[['fr', 'es', 'de', 'ja', 'zh', 'pt', 'ko', 'it', 'nl', 'ar', 'hi'].indexOf(l)]);
for (const [k, [web, types]] of Object.entries(TEMPLATES)) { const ty = types.split(' '); add(k, l => T[l][web].replace(/\{(\d)\}/g, (_, i) => `%${+i + 1}$${ty[i]}`)); }
add('Alarm %@', l => `${T[l]['Alarm']} %@`); add('%lld min', l => `%lld ${T[l]['min']}`); add('Lap %lld', l => `${T[l]['Lap']} %lld`);
const sorted = Object.fromEntries(Object.keys(strings).sort().map(k => [k, strings[k]]));
writeFileSync(root + 'apple/Shared/Localizable.xcstrings', JSON.stringify({ sourceLanguage: 'en', strings: sorted, version: '1.0' }, null, 2) + '\n');
console.log(`${Object.keys(sorted).length} strings, ${langs.length} languages`);
