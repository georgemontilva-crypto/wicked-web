import 'server-only';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import seed from './seed.json';
import aboutCopyUpdate from './about-copy-update.json';
import type {Catalog,PublicCatalog} from './catalog-types';
import {mysqlConfigured,ensureMysql,readMysql,mutateMysql} from './mysql-store';
import {applyMigrations,pendingMigrations} from './catalog-migrations';
export const dataDir=path.resolve(process.env.DATA_DIR||'./data');
const dataFile=path.join(dataDir,'catalog.json');
const queueState=globalThis as typeof globalThis&{archiveWriteQueue?:Promise<unknown>};
function defaults(data:Catalog):Catalog{data.subscribers??=[];data.settings={...seed.settings,...data.settings};const settings=data.settings as unknown as Record<string,string>;for(const [key,change]of Object.entries(aboutCopyUpdate))if(settings[key]===change.from)settings[key]=change.to;return data;}
async function readFileCatalog():Promise<Catalog>{try{return defaults(JSON.parse(await fs.readFile(dataFile,'utf8')));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;return defaults(structuredClone(seed) as Catalog);}}
async function ensureStorage(){if(mysqlConfigured())await ensureMysql(readFileCatalog,async data=>{await fs.mkdir(dataDir,{recursive:true});await fs.writeFile(path.join(dataDir,'catalog-before-mysql-'+Date.now()+'.json'),JSON.stringify(data),{mode:0o600,flag:'wx'});});}
const migrationState=globalThis as typeof globalThis&{wickdMigrations?:Promise<void>};
async function backupRemoved(results:Record<string,unknown>){try{await fs.mkdir(dataDir,{recursive:true});await fs.writeFile(path.join(dataDir,'catalog-migration-'+Date.now()+'.json'),JSON.stringify(results),{mode:0o600,flag:'wx'});}catch(e){console.warn('WICKD migration backup not written',(e as Error).message);}}
async function migrate(){const run=async(data:Catalog)=>{if(!pendingMigrations(data).length)return null;return applyMigrations(data);};const current=mysqlConfigured()?await readMysql():await readFileCatalog();if(!pendingMigrations(current).length)return;const results=mysqlConfigured()?await mutateMysql(run):await writeFileCatalog(run);if(results){await backupRemoved(results);console.info('WICKD catalog migrations applied',Object.keys(results));}}
async function ready(){await ensureStorage();if(!migrationState.wickdMigrations)migrationState.wickdMigrations=migrate().catch(e=>{migrationState.wickdMigrations=undefined;throw e;});await migrationState.wickdMigrations;}
export async function readCatalog():Promise<Catalog>{await ready();if(mysqlConfigured())return defaults(await readMysql());return readFileCatalog();}
export function publicCatalog(data:Catalog):PublicCatalog{const products=data.products.filter(p=>p.published);return {revision:data.revision,settings:{...data.settings,contactRecipientEmail:''},products,reports:data.reports.filter(r=>r.published&&products.some(p=>p.id===r.productId))};}
export async function mutateCatalog<T>(fn:(data:Catalog)=>T|Promise<T>):Promise<T>{await ready();if(mysqlConfigured())return mutateMysql(data=>fn(defaults(data)));return writeFileCatalog(fn);}
function writeFileCatalog<T>(fn:(data:Catalog)=>T|Promise<T>):Promise<T>{const operation=(queueState.archiveWriteQueue||Promise.resolve()).then(async()=>{const data=await readFileCatalog();const result=await fn(data);data.revision++;await fs.mkdir(dataDir,{recursive:true});const temp=dataFile+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(temp,JSON.stringify(data),{mode:0o600});await fs.rename(temp,dataFile);return result;});queueState.archiveWriteQueue=operation.catch(()=>undefined);return operation;}
