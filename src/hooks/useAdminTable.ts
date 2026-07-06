import { useCallback, useEffect, useState } from "react";
import {
  adminList,
  adminUpsert,
  adminDelete,
  type AdminTable,
} from "@/lib/admin.functions";

export function useAdminTable<T extends { id: string }>(table: AdminTable) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminList({ data: { table } });
      setRows(data as T[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (row: Partial<T>) => {
      const isNew = !row.id;
      try {
        const saved = (await adminUpsert({
          data: { table, row: row as Record<string, unknown> },
        })) as T;
        setRows((s) => {
          const exists = s.some((r) => r.id === saved.id);
          // Prepend new rows so they are immediately visible at the top.
          return exists ? s.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...s];
        });
        setError(null);
        if (isNew && typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return saved;
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذّر حفظ البيانات");
        throw e;
      }
    },
    [table],
  );

  const remove = useCallback(
    async (id: string) => {
      await adminDelete({ data: { table, id } });
      setRows((s) => s.filter((r) => r.id !== id));
    },
    [table],
  );

  return { rows, loading, error, refresh, save, remove, setRows };
}
