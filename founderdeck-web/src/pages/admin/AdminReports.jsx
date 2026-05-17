import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/reports');
      setReports(data.data ?? []);
    } catch {
      toast.error('Could not load reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const markReviewed = async (report) => {
    try {
      await api.patch(`/admin/reports/${report.id}/review`);
      setReports((current) => current.map((item) => (item.id === report.id ? { ...item, is_reviewed: true } : item)));
    } catch {
      toast.error('Could not mark report reviewed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-1 text-gray-400">Review community reports and moderation notes.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No reports yet.</div>
        ) : reports.map((report) => (
          <div key={report.id} className="flex flex-col gap-3 border-b border-white/10 p-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{report.reason}</p>
              <p className="mt-1 text-sm text-gray-500">Reporter: {report.reporter?.name ?? 'Member'}</p>
            </div>
            <button type="button" onClick={() => markReviewed(report)} disabled={report.is_reviewed} className="inline-flex w-fit items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-gray-950 disabled:opacity-50">
              <CheckCheck className="h-4 w-4" /> {report.is_reviewed ? 'Reviewed' : 'Mark reviewed'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
