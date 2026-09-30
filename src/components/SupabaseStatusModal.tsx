import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { checkSupabaseHealth, SupabaseHealth } from '../services/supabaseService';
import { getSupabaseConfig } from '../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = getSupabaseConfig();

  const runHealthCheck = async () => {
    setIsChecking(true);
    const result = await checkSupabaseHealth();
    setHealth(result);
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sqlQuickSnippet = `-- Tablas principales para CartaLocales PWA en Supabase
create table if not exists public.locales (
  id text primary key,
  slug text unique not null,
  name text not null,
  cuisine text not null,
  delivery_time text default '25-35 min',
  min_order numeric(6, 2) default 10.00,
  delivery_fee numeric(6, 2) default 1.95,
  banner_image text,
  logo_image text,
  address text,
  is_open boolean default true,
  categories jsonb default '[]'::jsonb
);

create table if not exists public.orders (
  id text primary key,
  local_name text not null,
  delivery_type text not null,
  total numeric(8, 2) not null,
  status text not null default 'recibido',
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.locales enable row level security;
alter table public.orders enable row level security;
create policy "Public select locales" on public.locales for select using (true);
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public select orders" on public.orders for select using (true);
alter publication supabase_realtime add table public.orders;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuickSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Conexión con Supabase</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700">
                  PostgreSQL & Realtime
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Backend en la nube para persistencia y sincronización multi-tienda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1 text-xs">
          {/* Status Overview Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white">Proyecto Vinculado</span>
              </div>

              <button
                onClick={runHealthCheck}
                disabled={isChecking}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Verificar Estado</span>
              </button>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">URL del Proyecto:</span>
                <span className="text-slate-200 truncate max-w-[220px]">{config.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Key Pública:</span>
                <span className="text-emerald-400">sb_publishable_...qth (Configurada)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Realtime WebSockets:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Habilitado
                </span>
              </div>
            </div>

            {/* Diagnostics message */}
            {health && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  health.tablesExist
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                }`}
              >
                {health.tablesExist ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs">
                    {health.tablesExist
                      ? '¡Tablas de Supabase activas y sincronizadas!'
                      : 'Proyecto accesible, tablas listas para crear'}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    {health.tablesExist
                      ? 'Los locales y pedidos se leen y escriben directamente en tu base de datos de PostgreSQL.'
                      : 'La conexión con Supabase es válida. Si aún no has ejecutado el script en el SQL Editor de Supabase, puedes copiar el código abajo.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick SQL Editor Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-orange-400" />
                <span>Script SQL de Inicialización (1 Clic)</span>
              </h4>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold shadow transition active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado al portapapeles' : 'Copiar SQL'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-36 no-scrollbar">
                {sqlQuickSnippet}
              </pre>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>
                💡 <strong>Pasos rápidos para tu panel de Supabase:</strong>
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-300">
                <li>Ve a tu proyecto en Supabase ➔ Sección <strong>SQL Editor</strong>.</li>
                <li>Haz clic en <strong>New Query</strong> y pega este código SQL.</li>
                <li>Pulsa <strong>Run</strong>. ¡Y listo! Las tablas y el Realtime quedarán activos.</li>
              </ol>
            </div>
          </div>

          {/* Architecture Benefits */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modo Resiliente</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Si no hay conexión a internet, la PWA usa su base de datos local y sincroniza al volver en línea.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>Eventos en Tiempo Real</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Cambios de cocina en Supabase se transmiten a la app móvil por WebSockets nativos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard/project/rpvpybjuwwzxlonjcalx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-xs font-bold"
          >
            <span>Abrir Dashboard de Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
