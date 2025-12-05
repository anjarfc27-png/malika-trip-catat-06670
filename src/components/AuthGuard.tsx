import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (!session) {
          // Clear any corrupt session data
          localStorage.removeItem("sb-nzsfrvgcyjedwiobctfq-auth-token");
          navigate("/auth");
        }
      }
      
      if (!session) {
        navigate("/auth");
      }
      
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        // Clear corrupt session data on error
        localStorage.removeItem("sb-nzsfrvgcyjedwiobctfq-auth-token");
        navigate("/auth");
        setLoading(false);
        return;
      }
      
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
