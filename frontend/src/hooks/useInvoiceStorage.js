const STORAGE_KEY = "invoice_history";

export function useInvoiceStorage() {
  const getAll = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const save = (invoice) => {
    const all = getAll();
    const entry = {
      id:        Date.now(),
      timestamp: new Date().toISOString(),
      ...invoice,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...all]));
    return entry;
  };

  const remove = (id) => {
    const filtered = getAll().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  const clear = () => localStorage.removeItem(STORAGE_KEY);

  return { getAll, save, remove, clear };
}