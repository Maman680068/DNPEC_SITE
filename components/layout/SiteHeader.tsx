import Topbar from "./Topbar";
import Ticker from "./Ticker";

export default function SiteHeader() {
  return (
    <header>
      <div className="flag-strip" />
      <Topbar />
      <Ticker />
    </header>
  );
}
