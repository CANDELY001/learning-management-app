import NoneDashboardNavbar from "@/components/NoneDashboardNavbar";
import Landing from "./page";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nondashboard-layout">
      <NoneDashboardNavbar />
      <main className="nondashboard-layout__main">{children}</main>
      <Footer />
    </div>
  );
}
