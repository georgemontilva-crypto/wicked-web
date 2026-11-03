import {cookies} from 'next/headers';
import {configured,equalSecret,issueSession,isAdmin,requireOrigin,jsonBody,rateLimit,apiError,sessionOptions,HttpError} from '@/lib/security';
export const runtime='nodejs';
export async function GET(){return Response.json({authenticated:await isAdmin(),configured:configured()},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){try{requireOrigin(request);if(!configured())throw new HttpError(503,'Administrator access has not been configured. Set ADMIN_PASSWORD and SESSION_SECRET on the server.');rateLimit(request,'login',8);const body=await jsonBody(request,2000);if(typeof body.password!=='string'||!equalSecret(body.password,process.env.ADMIN_PASSWORD!))throw new HttpError(401,'Incorrect password.');(await cookies()).set('archive_session',issueSession(),sessionOptions);return Response.json({authenticated:true});}catch(e){return apiError(e);}}
export async function DELETE(request:Request){try{requireOrigin(request);(await cookies()).delete('archive_session');return Response.json({authenticated:false});}catch(e){return apiError(e);}}
