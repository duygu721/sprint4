import { useEffect, useState } from "react";
import type { CampusEvent, Category } from "./types/campus-event";
import { events } from "./data/events";
import { filterByCategory, findEventById, searchEvents } from "./utils/filter-events";
import "./App.css";

type PageName = "home" | "events" | "detail" | "add" | "update";
const menu: { page: PageName; label: string }[] = [
  { page: "home", label: "Ana Sayfa" },
  { page: "events", label: "Etkinlikler" },
  { page: "add", label: "Ekle" },
];
const categories = [...new Set(events.map(event => event.category))];
const formCategories: Category[] = ["Seminer", "Atölye", "Söyleşi", "Yarışma"];
const formatDate = (date: string): string => new Date(date + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

function App() {
  const [page, setPage] = useState<PageName>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  function go(next: PageName, id: string | null = null): void {
    setPage(next);
    setSelectedId(id);
  }
  const selected = selectedId ? findEventById(events, selectedId) : undefined;
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  const filtered = filterByCategory(searchEvents(events, searchText), category);
  const title = page === "detail" ? selected?.title ?? "Etkinlik bulunamadı"
    : page === "add" ? "Etkinlik Ekle" : page === "update" ? "Etkinlik Güncelle"
    : page === "events" ? "Etkinlikler" : "Kampüs Etkinlikleri";

  useEffect(() => {
    document.title = `Kampüs Etkinlikleri — ${title}`;
  }, [title]);

  function renderCard(event: CampusEvent) {
    return <article className="etkinlik-karti" key={event.id}>
      <span className="tur-etiket">{event.category}</span>
      <h3>{event.title}</h3>
      <p className="detay-bilgi">
        <time dateTime={`${event.date}T${event.time}`}>{formatDate(event.date)} · {event.time}</time><br />
        {event.location}<br />Kontenjan: {event.capacity}
      </p>
      <a className="kart-link" href="#detail" onClick={e => { e.preventDefault(); go("detail", event.id); }}>Detayları gör →</a>
    </article>;
  }

  return <>
    <header><div className="header-kapsayici">
      <h1><a href="#home" onClick={e => { e.preventDefault(); go("home"); }}>{title}</a></h1>
      <nav aria-label="Ana menü">{menu.map(item =>
        <a key={item.page} href={`#${item.page}`} aria-current={page === item.page ? "page" : undefined}
          onClick={e => { e.preventDefault(); go(item.page); }}>{item.label}</a>
      )}</nav>
    </div></header>
    <main>
      {page === "home" && <>
        <p className="aciklama-metni">Fakültedeki seminer, atölye ve söyleşileri tek yerden takip edin.</p>
        <h2>Yaklaşan 2 etkinlik</h2>
        <section className="etkinlik-grid iki-sutun" aria-label="Yaklaşan etkinlikler">{upcoming.map(renderCard)}</section>
        <a className="btn-islem" href="#events" onClick={e => { e.preventDefault(); go("events"); }}>Tüm etkinlikleri gör →</a>
      </>}
      {page === "events" && <>
        <h2>Tüm etkinlikler</h2>
        <form className="filtre" onSubmit={e => e.preventDefault()}>
          <label htmlFor="arama">Etkinlik ara
            <input id="arama" type="search" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="atölye, kariyer..." />
          </label>
          <label htmlFor="kategori-filtre">Kategori
            <select id="kategori-filtre" value={category} onChange={e => setCategory(e.target.value as Category | "")}>
              <option value="">Tümü</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </form>
        <p id="sonuc" role="status">{filtered.length === 0 ? "Etkinlik bulunamadı." : `${filtered.length} etkinlik listeleniyor.`}</p>
        <section className="etkinlik-grid uc-sutun" aria-label="Etkinlik sonuçları">{filtered.map(renderCard)}</section>
      </>}
      {page === "detail" && !selected && <div className="hata-kutusu" role="alert">
        Etkinlik bulunamadı. <a href="#events" onClick={e => { e.preventDefault(); go("events"); }}>Listeye dön</a>
      </div>}
      {page === "detail" && selected && <article className={`detay-kapsayici${selected.image ? "" : " afissiz"}`}>
        {selected.image && <section className="detay-afis-alani"><figure>
          <img src={selected.image} alt={`${selected.title} etkinlik afişi`} />
          <figcaption>{selected.title} afişi</figcaption>
        </figure></section>}
        <section className="detay-icerik-alani">
          <h2>Etkinlik bilgileri</h2>
          <dl><dt>Tarih</dt><dd><time dateTime={`${selected.date}T${selected.time}`}>{formatDate(selected.date)}, {selected.time}</time></dd>
            <dt>Yer</dt><dd>{selected.location}</dd><dt>Kategori</dt><dd>{selected.category}</dd>
            <dt>Kontenjan</dt><dd>{selected.capacity}</dd></dl>
          <p className="metin-paragraf">{selected.description}</p>
          <p><a className="btn-islem" href="#update" onClick={e => { e.preventDefault(); go("update", selected.id); }}>Bu etkinliği güncelle</a></p>
          <a className="donus-linki" href="#events" onClick={e => { e.preventDefault(); go("events"); }}>← Listeye dön</a>
        </section>
      </article>}
      {(page === "add" || page === "update") && <>
        <h2>{title}</h2>
        <section className="form-kapsayici">
          <form key={page} id="etkinlik-formu" noValidate onSubmit={e => e.preventDefault()}>
            <div className="form-alan"><label htmlFor="ad">Etkinlik adı</label><input id="ad" name="ad" type="text" maxLength={80} required /></div>
            <div className="form-alan"><label htmlFor="kategori">Kategori</label><select id="kategori" name="kategori" defaultValue=""><option value="">Seçiniz</option>{formCategories.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className="form-alan"><label htmlFor="tarih">Tarih</label><input id="tarih" name="tarih" type="date" required /></div>
            <div className="form-alan"><label htmlFor="saat">Saat</label><input id="saat" name="saat" type="time" required /></div>
            <div className="form-alan"><label htmlFor="yer">Yer</label><input id="yer" name="yer" type="text" required /></div>
            <div className="form-alan"><label htmlFor="kontenjan">Kontenjan (isteğe bağlı)</label><input id="kontenjan" name="kontenjan" type="number" min={1} max={1000} step={1} /></div>
            <div className="form-alan"><label htmlFor="aciklama">Açıklama</label><textarea id="aciklama" name="aciklama" rows={5} /></div>
            <button className="btn-islem" type="submit">Kaydet</button>
          </form>
        </section>
      </>}
    </main>
    <footer><p>Duygu Sezer — 2416501052 — 2026</p></footer>
  </>;
}
export default App;

