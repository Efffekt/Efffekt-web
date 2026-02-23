import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

// Helper to build element trees without JSX
function h(type: string, props: Record<string, any>, ...children: any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children.length === 0 ? undefined : children,
    },
  };
}

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get('title') || 'EFFFEKT';
  const description = url.searchParams.get('description') || 'Nettsider, integrasjoner og AI-automatisering';

  // Fetch the Recoleta Bold font from the public directory
  const fontUrl = new URL('/fonts/Recoleta-Bold.woff', url.origin);
  const fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());

  const element = h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#080e10',
        padding: '60px 80px',
        fontFamily: 'Recoleta',
        position: 'relative',
        overflow: 'hidden',
      },
    },
    // Subtle gradient orb (decorative)
    h('div', {
      style: {
        position: 'absolute',
        top: '-120px',
        right: '-80px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(140, 120, 200, 0.15) 0%, transparent 70%)',
      },
    }),
    // Bottom accent
    h('div', {
      style: {
        position: 'absolute',
        bottom: '-100px',
        left: '-60px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100, 160, 180, 0.12) 0%, transparent 70%)',
      },
    }),
    // Content
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          zIndex: 1,
        },
      },
      // Title
      h('div', {
        style: {
          fontSize: title.length > 40 ? 48 : 56,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          marginBottom: 20,
        },
        children: title,
      }),
      // Description
      h('div', {
        style: {
          fontSize: 24,
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: 1.5,
          maxWidth: '800px',
        },
        children: description.length > 120 ? description.slice(0, 117) + '...' : description,
      })
    ),
    // Bottom bar with branding
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        },
      },
      h('div', {
        style: {
          fontSize: 28,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '-0.01em',
        },
        children: 'efffekt.no',
      }),
      h('div', {
        style: {
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.25)',
        },
        children: 'Teknologi som gir superkrefter',
      })
    )
  );

  return new ImageResponse(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Recoleta',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });
};
