import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import {
  FiHome,
  FiBookOpen,
  FiZap,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";
import { auth } from "../../lib/firebase";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { openModal } from "../../store/modalSlice";

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const isActive = (path: string) => router.pathname === path;

  const handleAuthClick = () => {
    if (user.uid) {
      signOut(auth);
    } else {
      dispatch(openModal("login"));
    }
  };

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar__logo">
        <img src="/assets/logo.png" alt="Summarist" />
      </Link>

      <nav className="sidebar__nav">
        <Link href="/for-you" className={`sidebar__link ${isActive("/for-you") ? "sidebar__link--active" : ""}`}>
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiHome /></span>
          <span>For you</span>
        </Link>
        <Link href="/library" className={`sidebar__link ${isActive("/library") ? "sidebar__link--active" : ""}`}>
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiBookOpen /></span>
          <span>My Library</span>
        </Link>
        <div className="sidebar__link sidebar__link--disabled">
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiZap /></span>
          <span>Highlights</span>
        </div>
        <div className="sidebar__link sidebar__link--disabled">
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiSearch /></span>
          <span>Search</span>
        </div>
      </nav>

      <nav className="sidebar__nav sidebar__nav--bottom">
        <Link href="/settings" className={`sidebar__link ${isActive("/settings") ? "sidebar__link--active" : ""}`}>
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiSettings /></span>
          <span>Settings</span>
        </Link>
        <div className="sidebar__link sidebar__link--disabled">
          <span className="sidebar__link-line" />
          <span className="sidebar__link-icon"><FiHelpCircle /></span>
          <span>Help &amp; Support</span>
        </div>
        <button className="sidebar__link" onClick={handleAuthClick}>
          <span className="sidebar__link-line sidebar__link-line--active" />
          <span className="sidebar__link-icon">{user.uid ? <FiLogOut /> : <FiLogIn />}</span>
          <span>{user.uid ? "Logout" : "Login"}</span>
        </button>
      </nav>
    </aside>
  );
}