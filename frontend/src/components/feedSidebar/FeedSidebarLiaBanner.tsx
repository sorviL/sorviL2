import "./FeedSidebarLiaBanner.scss";

export function FeedSidebarLiaBanner() {
  return (
    <aside className="feed-sidebar-lia-banner" role="region" aria-label="Promo Lia">
      <div className="feed-sidebar-lia-banner-header">
        <div className="feed-sidebar-lia-banner-header-copy">
          <h4 className="feed-sidebar-lia-banner-title">Conheça a Lia</h4>
        </div>
      </div>

      <p className="feed-sidebar-lia-banner-body">
        Peça recomendações, resumos rápidos e metas de leitura personalizadas sem sair do feed.
      </p>

      <a className="feed-sidebar-lia-banner-cta" href="/chat">
        Conversar com a Lia
        <span className="material-icons" aria-hidden="true">arrow_forward</span>
      </a>
    </aside>
  );
}