import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import RoomDetailPage from "@/pages/RoomDetailPage";
import RackDetailPage from "@/pages/RackDetailPage";
import InspectionFormPage from "@/pages/InspectionFormPage";
import InspectionDetailPage from "@/pages/InspectionDetailPage";
import ScanPage from "@/pages/ScanPage";
import FloorPlanPage from "@/pages/FloorPlanPage";
import HistoryPage from "@/pages/HistoryPage";
import ARViewPage from "@/pages/ARViewPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomDetailPage />} />
            <Route path="/rack/:rackId" element={<RackDetailPage />} />
            <Route path="/inspect/:rackId" element={<InspectionFormPage />} />
            <Route path="/inspection/:recordId" element={<InspectionDetailPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/ar" element={<ARViewPage />} />
            <Route path="/floorplan" element={<FloorPlanPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
