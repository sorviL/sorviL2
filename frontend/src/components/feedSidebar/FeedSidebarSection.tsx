import type { ReactNode } from "react";

type FeedSidebarSectionProps = {
  title: string;
  children: ReactNode;
};

export function FeedSidebarSection({ title, children }: FeedSidebarSectionProps) {
  return (
    <section className="feed-sidebar-section">
      <h3 className="feed-sidebar-title">{title}</h3>
      {children}
    </section>
  );
}