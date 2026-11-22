import { act, fireEvent, within } from "@testing-library/react";
import { screen, settle } from "./render";

/** The connectors store's page (`/connectors`), or a service's or a connection's page: the region on screen. */
const storeRoot = () => document.querySelector(".store") as HTMLElement;

/**
 * "Browse connectors" in Settings › Connectors (the band over the list, or the empty state's button): the store, a
 * page of its own. Returns its root, so `within(store)` reaches its search, tabs and lines.
 */
export async function openStore() {
  const browse = screen().getAllByRole("button", { name: "Ver conectores" })[0] as HTMLElement;
  await act(async () => fireEvent.click(browse));
  await settle(6);
  return storeRoot();
}

/** Types into the store's search: only the services that match stay, each with its own Connect. */
export async function searchStore(store: HTMLElement, query: string) {
  const box = within(store).getByRole("searchbox", { name: "Buscar conector" });
  await act(async () => fireEvent.change(box, { target: { value: query } }));
  await settle(2);
}

/** A service's page in the store (its line pressed): the page, named by its heading. */
export const service = (name: string) => {
  const page = document.querySelector(".store-page") as HTMLElement | null;
  if (!page || page.querySelector(".store-page__title h3")?.textContent !== name)
    throw new Error(`no page for ${name} on screen`);
  return page;
};

/** Opens a service's page from the store: searched for, then its line pressed. */
export async function openService(store: HTMLElement, name: string) {
  await searchStore(store, name);
  const line = [...store.querySelectorAll(".store-item__open")].find(
    (el) => el.querySelector(".store-item__text b")?.textContent === name,
  ) as HTMLElement | undefined;
  if (!line) throw new Error(`no line for ${name} in the store`);
  await act(async () => fireEvent.click(line));
  await settle(4);
  return service(name);
}

/** Picks a service in the store (searched for, so any service is in reach) and presses its own Connect. */
export async function pick(store: HTMLElement, name: string) {
  await searchStore(store, name);
  await act(async () => fireEvent.click(within(storeRoot()).getByRole("button", { name: `Conectar ${name}` })));
  await settle(2);
}

/** The connections listed in Settings › Connectors, by their names (what needs a person comes first). */
export const connectedNames = () =>
  [...document.querySelectorAll(".store-list .store-item--link .store-item__text b")].map((b) => b.textContent);

/** A connection's line in Settings › Connectors (the first whose name is `name`). */
export const connectionLine = (name: string) => {
  const line = [...document.querySelectorAll(".store-item--link")].find(
    (li) => li.querySelector(".store-item__text b")?.textContent === name,
  ) as HTMLElement | undefined;
  if (!line) throw new Error(`no connection named ${name} listed`);
  return line;
};

/**
 * Opens a connection's page from its line in Settings › Connectors: who uses it, tools, account and the rest, each
 * with its button. Returns the page.
 */
export async function openConnection(name: string) {
  const open = connectionLine(name).querySelector(".store-item__open") as HTMLElement;
  await act(async () => fireEvent.click(open));
  await settle(4);
  return storeRoot().querySelector(".store-page") as HTMLElement;
}

/** "Connectors" over a page: back to the list (or to the store). */
export async function backToList() {
  await act(async () => fireEvent.click(within(storeRoot()).getByRole("button", { name: "Conectores" })));
  await settle(4);
}

/** A connection's ⋯ on its page (Radix opens a menu from the keyboard here): its menu (Rename, another account…). */
export async function rowMenu(name: string) {
  await openConnection(name);
  const button = screen().getByRole("button", { name: `Mais ações de ${name}` });
  button.focus();
  await act(async () => {
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: "Enter" });
  });
  await settle(2);
  return screen().getByRole("menu");
}
