import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import AuthModal from "../auth/AuthModal";

const NO_CHROME_ROUTES = ["/", "/choose-plan"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const showChrome = !NO_CHROME_ROUTES.includes(router.pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [router.pathname]);

  if (!showChrome) {
    return (
      <>
        {children}
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div
        className={`sidebar__overlay ${mobileNavOpen ? "sidebar__overlay--visible" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <div className="page page--with-sidebar">
        <header className="topbar">
          <button
            className="sidebar__toggle--btn"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <FiMenu />
          </button>
          <SearchBar />
        </header>
        <div className="page__body">{children}</div>
      </div>
      <AuthModal />
    </>
  );
}
