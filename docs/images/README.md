# Documentation screenshots

The PNG files show the built card and its components with English demonstration entities. They do not show a live Home Assistant installation.

| File | Content |
| --- | --- |
| `overview-dark.png` | Full airflow view and compact native fan controls in a dark theme. |
| `overview-light.png` | The same English demonstration in a light theme. |
| `insights.png` | Maintenance, controller context, alerts, schedules, energy, balance, and summer advice. |
| `history.png` | Original-reading inspection, sensor series, zoom controls, and CSV export. |

## Reproduce the images

1. Install the repository dependencies with `npm ci`.
2. Build the card with `npm run build`.
3. Install Chromium with `npx playwright install chromium`.
4. Run `node scripts/readme-screenshots.mjs` from the repository root.

The renderer loads `comfoair-card.js` through a temporary loopback server. All card and component language settings use `en`. The browser locale uses `en-US`, and the timezone uses UTC.

The renderer supplies demonstration states and minimal HA host elements. The actual card bundle supplies its layout, controls, calculations, and history behavior. The host supplies the theme and icons. Service calls use a local no-op function.

The script downloads public Material Design SVG paths for the screenshot host. Internet access is necessary for image reproduction. The card itself does not load these screenshot assets.

## Asset credits

Screenshot icons come from [Pictogrammers Material Design Icons](https://github.com/Templarian/MaterialDesign-SVG). Their license appears in [LICENSE-MDI.txt](LICENSE-MDI.txt), with the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0).

The screenshot composition and demonstration data belong to this repository's documentation. The existing images under `/images` remain unchanged and do not appear in the new README gallery.
