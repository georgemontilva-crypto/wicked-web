import Link from 'next/link';
export default function NotFound(){return <main className="page-width" style={{paddingBlock:90}}><p className="eyebrow">404 / PAGE NOT FOUND</p><h1 style={{marginBlock:25}}>Page not found.</h1><p>This page is unavailable or may have moved.</p><Link className="button solid" href="/products" style={{marginTop:30}}>Explore the Collection</Link></main>}
