import type {Catalog,Product} from './catalog-types';

// One-time catalog changes applied to the live store (MySQL or JSON) on first access.
// Each migration is recorded in settings.catalogMigrations so it never runs twice,
// even if an admin later edits or deletes the records it touched.

const BADDER_ID='thc-badder';
const JAR_IDS=['collection-1','collection-2','collection-3','collection-4','collection-5'];

const badderVariants:[string,string,string,string][]=[
  ['blue-magic','Blue Magic','Sativa','#3f51d6'],
  ['d-lish','D-Lish','Hybrid','#ec3d97'],
  ['lulu-lemons','Lulu Lemons','Sativa','#f3d21f'],
  ['the-force','The Force','Indica','#8b45c9'],
  ['honey-belts','Honey Belts','Hybrid','#f2892a'],
  ['petrol-station','Petrol Station','Indica','#4fc23d'],
];

export const thcBadder:Product={
  id:BADDER_ID,
  name:'THC Badder',
  category:'THC Badder',
  format:'Display / syringe',
  unitWeight:'3 mL',
  weightUnit:'per Syringe',
  countLabel:'Dosing Syringe per Pouch',
  count:'1',
  displayCount:'5 pouches',
  description:'Explore six WICK\'D THC Badder varieties. Each pouch holds one 3 mL (0.101 fl oz) dosing syringe and is presented in a 5-pack display. Labels state Delta-9 THC below 0.3% and Texas compliant. View the labeled details and available batch documentation for each variety.',
  published:true,
  variants:badderVariants.map(([slug,name,classification,color])=>({id:'badder-'+slug,name,classification,color,images:['/catalog/badder-'+slug+'-a.webp','/catalog/badder-'+slug+'-b.webp']})),
};

type Migration={id:string;apply:(data:Catalog)=>unknown};

const migrations:Migration[]=[
  {
    id:'2026-11-remove-jars-add-badder',
    apply(data){
      if(data.products.some(p=>p.id===BADDER_ID))return {removed:[]};
      const isJar=(p:Product)=>JAR_IDS.includes(p.id)||/\bjar\b/i.test(p.format);
      const removed=data.products.filter(isJar);
      const removedIds=new Set(removed.map(p=>p.id));
      const removedReports=data.reports.filter(r=>removedIds.has(r.productId));
      data.products=[structuredClone(thcBadder),...data.products.filter(p=>!removedIds.has(p.id))];
      data.reports=data.reports.filter(r=>!removedIds.has(r.productId));
      return {removed,removedReports};
    },
  },
];

function appliedList(data:Catalog){const raw=(data.settings as unknown as Record<string,unknown>).catalogMigrations;return typeof raw==='string'&&raw?raw.split(','):[];}

export function pendingMigrations(data:Catalog){const done=appliedList(data);return migrations.filter(m=>!done.includes(m.id));}

export function applyMigrations(data:Catalog){
  const results:Record<string,unknown>={};
  const done=appliedList(data);
  for(const m of migrations){if(done.includes(m.id))continue;results[m.id]=m.apply(data);done.push(m.id);}
  (data.settings as unknown as Record<string,string>).catalogMigrations=done.join(',');
  return results;
}
