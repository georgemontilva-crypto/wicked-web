'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {Menu,X,Search,Asterisk} from 'lucide-react';
import type {Settings} from '@/lib/catalog-types';

export function SiteHeader({settings}:{settings:Settings}){const links=[[settings.navHome,'/'],[settings.navAbout,'/about'],[settings.navContact,'/contact'],[settings.navProducts,'/products'],[settings.navReports,'/lab-reports']];const pathname=usePathname();const [open,setOpen]=useState(false);return <header className="site-header"><Link className="wordmark" href="/" aria-label={settings.brand+' home'}>{settings.logo?<img src={settings.logo} alt={settings.brand} style={{height:66,width:150,objectFit:'contain'}}/>:<><Asterisk size={29} strokeWidth={2.6}/><span>{settings.brand}</span><sup>®</sup></>}</Link><nav className={open?'main-nav is-open':'main-nav'} aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href} className={pathname===href||href==='/products'&&pathname.startsWith('/products/')?'active':''} onClick={()=>setOpen(false)}>{label}</Link>)}</nav><div className="header-tools"><Link href="/products?search=1" aria-label="Search collections" className="icon-button"><Search size={19}/></Link><button className="icon-button mobile-menu" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>;}
