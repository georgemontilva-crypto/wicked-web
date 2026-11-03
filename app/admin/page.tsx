import {isAdmin,configured} from '@/lib/security';
import {readCatalog} from '@/lib/store';
import {AdminPanel} from '@/components/admin-panel';
export const dynamic='force-dynamic';export const metadata={title:'Archive Administration',robots:{index:false,follow:false}};
export default async function Admin(){const authenticated=await isAdmin();return <AdminPanel initial={authenticated?await readCatalog():null} configured={configured()}/>;}
