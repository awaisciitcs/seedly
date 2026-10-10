import 'server-only';
import crypto from 'node:crypto';
import { getScopedClient } from '../supabase/admin';
import { validateCatalogBody, adminId } from '../admin-validation';
import { RequestError } from '../request-guards';

const productFields = ['name','category_id','product_type','short_description','description','ingredients','usage_instructions','storage_instructions','flavor_profile','caffeine_level','steep_time','water_temp','image_url','badge','weight_grams','status'];
const kitFields = ['name','slug','category_id','package_size','short_description','description','ingredients','usage_instructions','storage_instructions','image_url','badge','status','compliance_status'];
export async function saveAdminCatalog(kind: 'product' | 'kit', raw: Record<string,unknown>, create: boolean) {
  const body = validateCatalogBody(raw,kind,create);
  const client = await getScopedClient();
  if (kind === 'product' && !create && body.variant_id) {
    if (body.id || body.variants || Object.keys(body).some(key=>!['variant_id','inventory_quantity','expected_updated_at'].includes(key))) throw new RequestError('Stock changes must be submitted separately.');
    if (body.inventory_quantity === undefined || typeof body.expected_updated_at !== 'string') throw new RequestError('Refresh the inventory list before changing stock.');
    const { data, error } = await client.from('product_variants').update({inventory_quantity:body.inventory_quantity,updated_at:new Date().toISOString()}).eq('id',body.variant_id).eq('updated_at',body.expected_updated_at).select('id');
    if (error) throw new Error('Stock update failed.');
    if (!data?.length) throw new RequestError('Stock changed while you were editing. Refresh before saving.',409);
    return {id:body.variant_id};
  }
  const id = create ? `${kind === 'kit' ? 'kit' : 'prod'}-${crypto.randomUUID()}` : adminId(body.id);
  const fields = kind === 'product' ? productFields : kitFields;
  const document: Record<string,unknown> = {id};
  for (const field of fields) if (body[field] !== undefined) document[field] = body[field];
  if (document.status === 'INACTIVE') document.status = 'ARCHIVED';
  if (body.price_minor !== undefined) document.price_minor=body.price_minor;
  else if (body.price_pkr !== undefined) document.price_minor=Math.round(body.price_pkr*100);
  if (body.compare_price_minor !== undefined) document.compare_price_minor=body.compare_price_minor;
  else if (body.compare_price_pkr !== undefined) document.compare_price_minor=body.compare_price_pkr ? Math.round(body.compare_price_pkr*100) : null;
  if (create) {
    document.slug=body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+crypto.randomBytes(3).toString('hex');
    document.status=body.status || 'ACTIVE'; document.currency='PKR';
    document.category_id=body.category_id || (kind==='kit'?'cat-kits':body.product_type==='tea'?'cat-teas':'cat-seeds');
    document.image_url=body.image_url || (kind==='kit'?'/images/products/complete-kit.jpg':'/images/products/pumpkin-seeds.jpg');
    if (kind==='product') { document.sku='SED-'+crypto.randomBytes(6).toString('hex').toUpperCase();document.product_type=body.product_type || 'seed'; }
  }
  let children: Record<string,unknown>[] | null = null;
  if (kind==='product' && (create || body.variants)) {
    const variants=body.variants || [{weight_grams:body.weight_grams||250,price_pkr:body.price_pkr,compare_price_pkr:body.compare_price_pkr,inventory_quantity:body.initial_stock ?? 0,status:'ACTIVE'}];
    children=variants.map((v: Record<string,any>,i:number)=>({id:v.id || 'var-'+crypto.randomUUID(),product_id:id,sku:v.id ? undefined : 'SED-'+crypto.randomBytes(8).toString('hex').toUpperCase(),option_name:'Pack Size',option_value:`${v.weight_grams}g`,weight_grams:v.weight_grams,price_minor:Math.round(v.price_pkr*100),compare_price_minor:v.compare_price_pkr ? Math.round(v.compare_price_pkr*100) : null,inventory_quantity:v.inventory_quantity,status:['INACTIVE','ARCHIVED'].includes(v.status)?'ARCHIVED':'ACTIVE',sort_order:i,expected_updated_at:v.expected_updated_at}));
    const primary=children!.find(v=>v.status==='ACTIVE') || children![0];
    document.price_minor=primary.price_minor;document.compare_price_minor=primary.compare_price_minor;document.weight_grams=primary.weight_grams;
  } else if (kind==='kit' && body.items) children=body.items;
  if (body.expected_updated_at) document.expected_updated_at=body.expected_updated_at;
  const { data,error }=await (client.rpc as any)('save_admin_catalog',{p_kind:kind,p_document:document,p_children:children,p_create:create});
  if (error) {
    if (error.code==='PGRST202' || error.code==='42883') throw new RequestError('Catalog saves require the database upgrade. Please contact the administrator.',503);
    if (error.code==='P0002') throw new RequestError('This catalog item no longer exists.',404);
    if (error.code==='40001') throw new RequestError('This item changed while you were editing. Refresh before saving.',409);
    if (['22023','23505','23503','23514'].includes(error.code)) throw new RequestError('The catalog selection or values are invalid. Review prices, pack sizes and components.',400);
    throw new Error('Catalog save failed.');
  }
  return data;
}

export async function archiveAdminCatalog(kind: 'product'|'kit', id: string) {
  return saveAdminCatalog(kind,{id:adminId(id),status:'ARCHIVED'},false);
}
