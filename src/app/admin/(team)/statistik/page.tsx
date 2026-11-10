import { StatistikAnsicht, ZEITRAEUME, type Statistik } from "@/components/StatistikAnsicht";
import { teamMitglied } from "@/lib/supabase-server";

export const metadata = { title: "Statistik" };

type Props = { searchParams: Promise<{ tage?: string }> };

export default async function StatistikSeite({ searchParams }: Props) {
  const mitglied = await teamMitglied();
  if (!mitglied) return null;
  const gewaehlt = Number((await searchParams).tage);
  const tage = ZEITRAEUME.includes(gewaehlt) ? gewaehlt : 30;

  const { data, error } = await mitglied.supabase.rpc("besuchsstatistik", { tage });
  if (error) throw error;
  return <StatistikAnsicht s={data as Statistik} tage={tage} />;
}
