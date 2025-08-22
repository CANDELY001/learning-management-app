import Link from "next//link";
import React from "react";

const NoneDashboardNavbar = () => {
  return (
    <nav className="nonedashboard-layout">
      <div className="nondashboard-navbar__container">
        <Link href="/" className="nondashboard-navbar__brand">
          CANLEARN
        </Link>
      </div>
    </nav>
  );
};

export default NoneDashboardNavbar;
