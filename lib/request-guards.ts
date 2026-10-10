export class RequestError extends Error { constructor(message:string,public status=400){super(message);} }
export function requireSameOrigin(request:Request) {
  const origin=request.headers.get('origin');
  const requestHost=request.headers.get('host') || new URL(request.url).host;
  let matches=true;
  if(origin){try{const incoming=new URL(origin);matches=['http:','https:'].includes(incoming.protocol) && incoming.host.toLowerCase()===requestHost.toLowerCase();}catch{matches=false;}}
  if(request.headers.get('sec-fetch-site')==='cross-site'||!matches)throw new RequestError('Please use the Seedly website to make this request.',403);
}
export async function readBody(request:Request,maxBytes:number):Promise<Uint8Array>{
  const length=request.headers.get('content-length');
  if(length&&Number(length)>maxBytes)throw new RequestError('Request is too large.',413);
  const reader=request.body?.getReader();if(!reader)throw new RequestError('Request body is required.');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new RequestError('Request is too large.',413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export async function readJson(request:Request,maxBytes=32768):Promise<Record<string,unknown>>{
  const bytes=await readBody(request,maxBytes);
  try{const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw new RequestError('Invalid request body.');}
}

/** Parse bounded multipart input and distinguish invalid uploads from outages. */
export async function readMultipart(request: Request, maxBytes: number): Promise<FormData> {
  const contentType = request.headers.get('content-type') || '';
  if (!/^multipart\/form-data(?:\s*;|$)/i.test(contentType)) {
    throw new RequestError('Use the file upload form to send this file.', 415);
  }
  const body = await readBody(request, maxBytes);
  let form: FormData;
  try {
    form = await new Response(body as BodyInit, { headers: { 'Content-Type': contentType } }).formData();
  } catch {
    throw new RequestError('The file upload is incomplete or invalid. Please select the file again.', 400);
  }
  if (Array.from(form.keys()).length > 8) throw new RequestError('Too many fields in the file upload.', 400);
  return form;
}
