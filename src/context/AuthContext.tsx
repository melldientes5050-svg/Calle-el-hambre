import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole, AppUserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  assignedLocalId: string | null;
  allUsers: AppUserProfile[];
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  userName: string;
  userPhone: string;
  updateUserRole: (userId: string, newRole: UserRole, assignedLocalId?: string) => Promise<void>;
}

const USERS_STORAGE_KEY = 'cartalocales_registered_users';
const CURRENT_ROLE_STORAGE_KEY = 'cartalocales_current_role';
const CURRENT_LOCAL_STORAGE_KEY = 'cartalocales_current_assigned_local';

const INITIAL_PROFILES: AppUserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'melldientes5050@gmail.com',
    fullName: 'Administrador Maestro',
    firstName: 'Admin',
    lastName: 'Principal',
    phone: '0414-9988771',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-prop-1',
    email: 'maria.hamburguesas@ejemplo.com',
    fullName: 'María Propietaria',
    firstName: 'María',
    lastName: 'Pérez',
    phone: '0412-5554321',
    role: 'propietario',
    assignedLocalId: 'loc-hamburguesas',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-gen-1',
    email: 'carlos.cliente@ejemplo.com',
    fullName: 'Carlos Gómez',
    firstName: 'Carlos',
    lastName: 'Gómez',
    phone: '0424-1122334',
    role: 'general',
    createdAt: new Date().toISOString(),
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Users database for Admin role assignments
  const [allUsers, setAllUsers] = useState<AppUserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  // Role and assigned local
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY);
      return (saved as UserRole) || 'general'; // Default is always general
    } catch {
      return 'general';
    }
  });

  const [assignedLocalId, setAssignedLocalId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENT_LOCAL_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Save users to storage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch {
      // ignore
    }
  }, [allUsers]);

  // Sync role to storage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, role);
      if (assignedLocalId) {
        localStorage.setItem(CURRENT_LOCAL_STORAGE_KEY, assignedLocalId);
      } else {
        localStorage.removeItem(CURRENT_LOCAL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [role, assignedLocalId]);

  // Check active Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        syncUserRole(currentUser);
      } else {
        setRole('general');
        setAssignedLocalId(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        syncUserRole(currentUser);
      } else {
        setRole('general');
        setAssignedLocalId(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const syncUserRole = (u: User) => {
    const email = u.email?.toLowerCase() || '';

    // If master admin email, grant admin role
    if (email === 'melldientes5050@gmail.com') {
      setRole('admin');
      setAssignedLocalId(null);
      return;
    }

    // Check if user exists in allUsers table
    const existing = allUsers.find((p) => p.email.toLowerCase() === email || p.id === u.id);
    if (existing) {
      setRole(existing.role);
      setAssignedLocalId(existing.assignedLocalId || null);
    } else {
      // TODOS NACEN CON ROL GENERAL
      setRole('general');
      setAssignedLocalId(null);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    try {
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();
      const cleanPhone = phone.trim();
      const fullName = `${cleanFirstName} ${cleanLastName}`.trim();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: fullName,
            phone: cleanPhone,
            role: 'general', // TODOS NACEN CON ROL GENERAL
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);

        // TODOS los usuarios registrados nacen con rol general
        const userRole: UserRole = 'general';

        const newProfile: AppUserProfile = {
          id: data.user.id,
          email: data.user.email || email.trim(),
          firstName: cleanFirstName,
          lastName: cleanLastName,
          fullName,
          phone: cleanPhone,
          role: userRole,
          createdAt: new Date().toISOString(),
        };

        setAllUsers((prev) => [newProfile, ...prev.filter((p) => p.email.toLowerCase() !== email.toLowerCase())]);
        setRole(userRole);
        setAssignedLocalId(null);
      }
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Error inesperado al registrar usuario' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        syncUserRole(data.user);
      }
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Error inesperado al iniciar sesión' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole('general');
      setAssignedLocalId(null);
    } catch {
      // ignore
    }
  };

  // Admin capability: Assign role & business carta to user
  const updateUserRole = async (userId: string, newRole: UserRole, targetLocalId?: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            assignedLocalId: newRole === 'propietario' ? targetLocalId : undefined,
          };
        }
        return u;
      })
    );

    // If current logged-in user is the one modified
    if (user && user.id === userId) {
      setRole(newRole);
      setAssignedLocalId(newRole === 'propietario' ? (targetLocalId || null) : null);
    }
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    (role === 'admin' ? 'Administrador' : role === 'propietario' ? 'Usuario Propietario' : 'Usuario General');

  const userPhone =
    user?.user_metadata?.phone ||
    allUsers.find((u) => u.email === user?.email)?.phone ||
    '';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        assignedLocalId,
        allUsers,
        signUp,
        signIn,
        signOut,
        userName,
        userPhone,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
