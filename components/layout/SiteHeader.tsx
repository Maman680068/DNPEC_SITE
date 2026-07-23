import Topbar from "./Topbar";
import Ticker from "./Ticker";
import MainNav from "./MainNav";

export default function SiteHeader() {
  return (
    <header>
      <div className="flag-strip" />
      <Topbar />
      <Ticker />
      <MainNav />
    </header>
  );
}
