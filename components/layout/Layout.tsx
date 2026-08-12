import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import AuthModal from "../auth/AuthModal";

const NO_CHROME_ROUTES = ["/", "/choose-plan"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const showChrome = !NO_CHROME_ROUTES.includes(router.pathname);

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
      <Sidebar />
      <div className="page page--with-sidebar">
        <header className="topbar">
          <SearchBar />
        </header>
        <div className="page__body">{children}</div>
      </div>
      <AuthModal />
    </>
  );
}
