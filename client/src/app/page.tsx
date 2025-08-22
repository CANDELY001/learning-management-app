import NoneDashboardNavbar from "@/components/NoneDashboardNavbar";
import Landing from "./(nondashboard)/page";

export default function Home() {
  return (
    <div className="nondashboard-layout">
      <NoneDashboardNavbar />
      <main className="nondashboard-layout__main">
        <Landing />
      </main>
      <Footer />
    </div>
  );
}
