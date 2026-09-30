import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre y apellido.');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Por favor ingresa tu número de teléfono móvil.');
        setLoading(false);
        return;
      }

      const res = await signUp(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        phone.trim()
      );
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('¡Usuario registrado con éxito con Rol General!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } else {
      const res = await signIn(email.trim(), password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('¡Sesión iniciada correctamente!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              {mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {mode === 'signup' ? 'Registro de Usuario' : 'Iniciar Sesión'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {mode === 'signup'
                  ? 'Todos los usuarios se registran con Rol General'
                  : 'Accede a tu cuenta y seguimiento de pedidos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signin'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs overflow-y-auto no-scrollbar flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 flex items-start gap-2 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nombre *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Carlos"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Gómez"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Teléfono Móvil *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0414-1234567"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Notice Rol General */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-orange-400 shrink-0" />
                <span>Asignación automática: <strong>Rol Usuario General</strong></span>
              </div>
            </>
          )}

          {/* Correo Electrónico */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </span>
            ) : mode === 'signup' ? (
              'Crear Usuario (Rol General)'
            ) : (
              'Entrar a Mi Cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
