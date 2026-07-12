import { create } from "zustand";

const useAppStore = create((set) => ({
  // Auth / session
  isAuthenticated: false,
  workerName: "",
  login: (name) =>
    set({
      isAuthenticated: true,
      workerName: (name && name.trim()) || "Warehouse Worker",
      currentPage: "dashboard",
    }),
  logout: () => set({ isAuthenticated: false, workerName: "" }),
  setWorkerName: (name) => set({ workerName: name }),

  // Backend connection status
  backendConnected: false,
  setBackendConnected: (status) => set({ backendConnected: status }),

  // Current page
  currentPage: "dashboard",
  setCurrentPage: (page) => set({ currentPage: page }),

  // Alerts
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [{ id: Date.now(), ...alert }, ...state.alerts].slice(0, 10),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // Current inspection state — persists across page navigation
  currentImagePath: null,
  ocrResult: null,
  validationResult: null,
  savedInspection: null,
  isProcessing: false,
  isSaving: false,
  inspectionError: null,

  setCurrentImagePath: (path) => set({ currentImagePath: path }),
  setOcrResult: (result) => set({ ocrResult: result }),
  setValidationResult: (result) => set({ validationResult: result }),
  setSavedInspection: (inspection) => set({ savedInspection: inspection }),
  setIsProcessing: (val) => set({ isProcessing: val }),
  setIsSaving: (val) => set({ isSaving: val }),
  setInspectionError: (err) => set({ inspectionError: err }),
  resetInspection: () =>
    set({
      currentImagePath: null,
      ocrResult: null,
      validationResult: null,
      savedInspection: null,
      isProcessing: false,
      isSaving: false,
      inspectionError: null,
    }),
}));

export default useAppStore;
