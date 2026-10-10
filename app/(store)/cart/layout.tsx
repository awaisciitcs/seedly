import type { ReactNode } from 'react';
import {getContentMetadata} from '@/lib/cms/metadata';
export async function generateMetadata(){return getContentMetadata('cart');}
export default function PageLayout({children}:{children:ReactNode}){return children;}
