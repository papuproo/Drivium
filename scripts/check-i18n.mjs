import { readFileSync } from "node:fs";

const load = (l) => JSON.parse(readFileSync(`messages/${l}.json`, 'utf8'));
const fist = (o, p = '') =>
    Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' ? fist(v, p ? `${p}.${k}` : k) : [p ? `${p}.${k}` : k]
    );

const es = new Set(fist(load('es')));
const en = new Set(fist(load('en')));
const onlyEs = [...es].filter((k) => !en.has(k));
const onlyEn = [...en].filter((k) => !es.has(k));

console.log(`Claves → es: ${es.size} · en: ${en.size}`);
if (onlyEs.length) console.log('Solo en es: ', onlyEs);
if (onlyEn.length) console.log('Solo en en: ', onlyEn);
process.exit(onlyEs.length || onlyEn.length ? 1 : 0);