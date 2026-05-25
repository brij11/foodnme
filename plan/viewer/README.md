# Spec Browser

A read-only viewer for `stories/`. Drop into any project that uses `/manage-stories` — the viewer renders whatever it finds in `../stories/INDEX.md`. Neutral visual design (warm paper background, restrained rust accent, serif H1) with auto + manual dark mode.

## Run

From the project root:

```bash
./plan/viewer/serve.py start      # background — terminal stays yours
./plan/viewer/serve.py stop       # kills it
./plan/viewer/serve.py status     # is it running, on what port
./plan/viewer/serve.py            # foreground — Ctrl+C to stop (logs visible)
```

`start` picks the first free port in 8000–8050, roots the server at `plan/` (so the viewer sees `stories/`, `design/`, and the spec markdown as siblings), opens your browser to `http://localhost:<port>/viewer/`, writes the pid to `/tmp/foodnme-serve.pid` and logs to `/tmp/foodnme-serve.log`.

If the shebang errors because your shell's `python3` alias points at a missing binary, invoke explicitly:

```bash
python3.13 plan/viewer/serve.py start
```

(Browsers block `fetch()` under `file://` — so a static server is required; you can't just double-click `index.html`.)

## Layout

- **Left pane** — topics grouped by sprint. Click to filter the list.
- **Middle pane** — filtered story list. Filters: search (`/`), sprint, status, owner.
- **Right pane** — full story detail: metadata chips, dependency / blocks graph, rendered markdown.

## Keyboard

- `/` — focus search · `Esc` — clear search
- `J` / `↓` — next story · `K` / `↑` — previous story
- `Enter` — focus the detail pane

## Theme

A small button in the top-right cycles `auto → light → dark → auto`. Choice is remembered in localStorage. Default `auto` follows your OS's `prefers-color-scheme`.

## Sharing

URLs are hash-routed: `#/<topic>/<id>`. Example: `http://localhost:8000/viewer/#/blog/story-blog-02`. (Port may differ if 8000 was busy — see the launcher banner.)

## Notes

- Refresh after running `/manage-stories index` — the viewer reads `stories/INDEX.md` on load.
- The viewer is read-only. Edit stories through `/manage-stories` or your editor.
