import type { Route } from "./routes";
import { getDocument, getDefaultDocument } from "./documents";

const SITE_TITLE = "l5z12";

export function pageTitle(route: Route): string {
  if (route.name === "home") {
    const doc = getDefaultDocument();
    return doc ? `${doc.document.id} | ${SITE_TITLE}` : SITE_TITLE;
  }
  if (route.name === "documents") return `Documents | ${SITE_TITLE}`;
  if (route.name === "document") {
    const id = route.params.id ?? "";
    const doc = getDocument(id);
    return doc
      ? `${doc.document.id} | ${SITE_TITLE}`
      : `Not found | ${SITE_TITLE}`;
  }
  return `Not found | ${SITE_TITLE}`;
}
