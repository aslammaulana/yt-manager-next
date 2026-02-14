import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // 1. Dashboard, Admin, Settings Protection
    if (path.startsWith('/dashboard') || path.startsWith('/account')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Check Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, access_expires_at')
            .eq('id', user.id)
            .single();

        const role = profile?.role || 'inactive';

        // Check Expiration for Members (time-based access)
        if (role === 'member' && profile?.access_expires_at) {
            const expiresAt = new Date(profile.access_expires_at).getTime();
            const now = new Date().getTime();

            if (now > expiresAt) {
                // Expired: Redirect to Pricing
                return NextResponse.redirect(new URL('/pricing?expired=true', request.url));
            }
        }

        // Check Expiration for Trial users
        if (role === 'trial' && profile?.access_expires_at) {
            const expiresAt = new Date(profile.access_expires_at).getTime();
            const now = new Date().getTime();

            if (now > expiresAt) {
                return NextResponse.redirect(new URL('/pricing?expired=true', request.url));
            }
        }

        // Redirect 'inactive' to Pricing (except settings - they can set password)
        if (role === 'inactive' && !path.startsWith('/pricing') && !path.startsWith('/account/settings')) {
            return NextResponse.redirect(new URL('/pricing', request.url));
        }

        // Protect Admin Route
        if (path.startsWith('/dashboard/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 2. Redirect Authenticated Users away from Login/Signup/Checkout
    if ((path === '/auth/login' || path === '/auth/signup' || path.startsWith('/checkout')) && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
