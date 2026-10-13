import data from "./reference-data.json";

export function CarouselMarquee() {
  return <div
    className="reference-slides-marquee"
    role="region"
    aria-label="Lâminas do carrossel. Passe o mouse ou mantenha o foco aqui para pausar o movimento."
    tabIndex={0}
  >
    <div className="reference-slides-track">
      {[0, 1].map((copy) => <div className="reference-slides-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
        {data.SL.map(([page, title, supporting, theme]) => <div key={page} className={`reference-slide ${theme === "cover" ? "is-dark" : ""}`}>
          <p className="reference-slide-number">{page} / 07</p>
          <h3>{title}</h3>
          <p>{supporting}</p>
          <footer><span className="reference-logo-placeholder">logo.png</span><span>@piersecurity</span></footer>
        </div>)}
      </div>)}
    </div>
  </div>;
}
