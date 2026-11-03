import {readCatalog} from '@/lib/store';
import {mysqlConfigured} from '@/lib/mysql-store';
export const dynamic='force-dynamic';
export async function GET(){try{await readCatalog();return Response.json({status:'ok',storage:mysqlConfigured()?'mysql':'file'});}catch{console.error('Health check: catalog storage unavailable.');return Response.json({status:'unavailable'},{status:503});}}
