import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`);
    }

    // Log what we get from the session exchange
    console.log("Session data:", data);
    console.log("Provider token:", data.session?.provider_token);

    if (data.session?.provider_token && data.session?.user?.id) {
      // Store the GitHub token in the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          github_token: data.session.provider_token,
        },
      });

      if (updateError) {
        console.error("Error storing GitHub token:", updateError);
      } else {
        console.log("GitHub token stored successfully");
      }
    }
  }

  // Redirect to the main page after successful authentication
  return NextResponse.redirect(requestUrl.origin);
}
