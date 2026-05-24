import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario)

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Painel</h1>
      <p className="text-muted-foreground">
        Bem-vindo, {usuario?.nomeCompleto}. Perfil: {usuario?.perfilNome}.
      </p>
    </div>
  )
}
