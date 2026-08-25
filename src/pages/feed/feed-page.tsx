import { useQuery } from '@tanstack/react-query';

import { sessionQueries } from '@entities/session';
import { SPECIALITY_LABELS } from '@entities/user';

import { healthQueries } from '@shared/api/health.queries';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';

interface StatusRowProps {
  label: string;
  value: string;
  ok: boolean;
  pending: boolean;
}

const StatusRow = ({ label, value, ok, pending }: StatusRowProps) => {
  const tone = pending ? 'text-body' : ok ? 'text-system' : 'text-destructive';

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={`font-mono text-sm tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
};

export const FeedPage = () => {
  const session = useQuery(sessionQueries.current());
  const health = useQuery(healthQueries.status());

  const user = session.data;

  return (
    <div className="flex flex-col gap-8">
      <section className="border-border bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-11">
            <AvatarFallback className="font-mono text-xs">
              {user ? user.firstName[0] : '?'}
              {user ? user.lastName[0] : ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading…'}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              @{user?.nickname ?? '…'}
            </p>
          </div>
          {user ? (
            <Badge variant="secondary" className="ml-auto">
              {SPECIALITY_LABELS[user.speciality]}
            </Badge>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          What is next
        </h2>
        <p className="text-body max-w-prose text-sm leading-relaxed">
          The feed itself arrives in module 1: post cards, filters that live in
          the URL, Markdown with syntax highlighting, and likes with optimistic
          updates. This screen exists so module 0 has somewhere to land.
        </p>
      </section>

      <section className="border-border bg-card overflow-hidden rounded-lg border">
        <h2 className="border-border text-muted-foreground border-b px-5 py-3 font-mono text-[11px] tracking-widest uppercase">
          API status
        </h2>
        <dl className="divide-rule-soft divide-y">
          <StatusRow
            label="Server"
            value={
              health.isPending
                ? 'checking…'
                : health.isError
                  ? 'unreachable'
                  : health.data.status
            }
            ok={!health.isError && health.data?.status === 'ok'}
            pending={health.isPending}
          />
          <StatusRow
            label="Database"
            value={
              health.isPending
                ? '—'
                : health.isError
                  ? 'unknown'
                  : health.data.database
            }
            ok={health.data?.database === 'connected'}
            pending={health.isPending}
          />
        </dl>
      </section>
    </div>
  );
};
