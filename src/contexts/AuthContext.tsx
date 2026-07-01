/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  dni: string | null;
  nombres: string;
  correo: string;
  // Nuevas columnas directas
  fecha_nacimiento?: string | null;
  genero?: string | null;
  merito_academico?: string | null;
  area_interes?: string | null;
  tiene_conadis?: boolean;
  es_deportista?: boolean;
  hace_voluntariado?: boolean;
  hijo_docente?: boolean;
  acepta_privacidad?: boolean;
  privacidad_fecha?: string | null;
  perfil_detalles: {
    tipo_colegio?: string;
    sisfoh?: string;
    sisfoh_fecha_vencimiento?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    institucionActual?: string;
    condiciones?: Record<string, boolean>;
    nivelPerfil?: number;
    notas?: {
      gpa?: number;
      año3?: number;
      año4?: number;
      año5?: number;
    };
    colegio?: {
      ano_egreso?: string;
    };
    idiomas?: {
      nivelIngles?: string;
      instituto?: string;
      certificacion_oficial?: boolean;
    };
    area_interes?: string;
    merito_academico?: string;
    hace_voluntariado?: boolean;
    es_deportista?: boolean;
    tiene_liderazgo?: boolean;
    tiene_emprendimiento?: boolean;
    acepta_privacidad?: boolean;
  };
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        // Fallback profile if database fetch fails or hasn't created the user row yet
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const data = await fetchProfile(user.id);
      if (data) {
        setProfile(data);
      }
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfile(currentUser.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setLoading(true);
        fetchProfile(currentUser.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
