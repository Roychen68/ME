# Roy's portfolio

A bilingual personal website and résumé for Roy, a curious second-year high school student in Information Technology (資訊科高二學生). The full-screen dark cover uses Roy's photo as the background with his short introduction overlaid. Floating navigation sits on the left edge, with competition photography, selected GitHub projects, an animated introduction, and automatic endless scrolling below.

The site uses plain HTML, CSS, and JavaScript. It needs no framework, installation step, compilation, API key, or server at deployment time. Fonts and photographs are stored locally.

## Run locally

With a current Node.js installation (Node 22 or later recommended):

```sh
npm run dev
```

Open [localhost:4173](http://localhost:4173). Set `PORT` if that port is occupied. No `npm install` is needed.

For the existing XAMPP checkout, start Apache and open [localhost/introduce/](http://localhost/introduce/).

```sh
npm run check
```

This checks JavaScript syntax, local assets, both translation dictionaries, unique IDs, anchor targets, and paths that must also work under a GitHub Pages project subdirectory. Browser testing is still needed for layout, keyboard access, animation, and printing.

## Publish on GitHub Pages

1. Commit the complete folder to a GitHub repository, including `assets/` and the `.nojekyll` file.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, select your branch, and select **/ (root)**.
4. Save. GitHub will show the published address when deployment finishes.

There is no build command. All internal assets use relative URLs, so the same files work at `https://Roychen68.github.io/your-repository/` or a domain root. Do not change local asset URLs to begin with `/` unless you intentionally deploy only at a domain root.

## Personalize

| File | Purpose |
| --- | --- |
| `content.js` | English and Traditional Chinese text, gallery content, and optional configuration |
| `index.html` | Page structure, profile links, projects, metadata, and search-engine profile information |
| `styles.css` | Layout, colors, responsive design, motion, and print styles |
| `app.js` | Language switching, intro animation, gallery, navigation, scroll loop, Discord, and résumé behavior |
| `assets/images/` | Competition photos and GitHub avatar |
| `assets/images/sources.json` | Original photo filenames, sources, and image processing details |

When editing text, update the matching key in both `PORTFOLIO_CONTENT.en` and `PORTFOLIO_CONTENT.zh`. Update the English fallback text in `index.html` as well, so the core introduction remains useful without JavaScript. Check project destinations and metadata when changing identity or résumé details.

The **Résumé** button opens a printable résumé in the selected language. Choose **Print / Save PDF**, then use your browser's **Save as PDF** destination. This produces a PDF from the current content; it is not a separate résumé file that can become outdated.

Endless scrolling works automatically: a fresh downward mouse-wheel, trackpad, or swipe gesture at the footer returns to the cover. A fresh ArrowDown, PageDown, or Space keypress does the same when focus is outside a link, button, or input control. The footer stays reachable, and scrolling through the rest of the page uses normal browser behavior. There are no animation or scrolling switches. The design stays dark; English and Traditional Chinese are selected with the small language controls in the header. Reduced-motion preferences disable decorative motion.

Discord contact copies `nimitz9250`. Discord does not provide a personal-profile iframe for a username. To display an official server widget, enable **Server Widget** in a Discord server you manage and set its numeric server ID in `content.js`:

```js
window.PORTFOLIO_CONFIG.discordServerId = 'YOUR_DISCORD_SERVER_ID';
```

The widget remains hidden when that value is empty. The server must allow its widget publicly for the embed to work.

## Content and sources

- Roy supplied his schooling as a second-year high school student in Information Technology (資訊科高二學生), his electronics/electrical field of study and interests in software development and local AI agents, his participation in the **Web Technologies junior category** at **WorldSkills Asia 2025** with Chinese Taipei, and attendance in **GJ-8-9 創製波動力** through the **青年百億海外圓夢基金計畫**.
- Public projects and the profile avatar come from [Roychen68 on GitHub](https://github.com/Roychen68). Selected repositories are [Vocabulary](https://github.com/Roychen68/Vocabulary), [GoldenHandAwardVisiting](https://github.com/Roychen68/GoldenHandAwardVisiting), and [world-skills-2025-F-latest](https://github.com/Roychen68/world-skills-2025-F-latest). The project previews are interface concepts, not screenshots of deployed applications.
- Competition photographs come from [the Google Drive album Roy supplied](https://drive.google.com/drive/folders/1zMkNit_qeTucnTMFs3HvdfXUgva6xG8y). The local WebP and JPEG versions were resized, and image metadata was removed. Individual source links are recorded in `assets/images/sources.json`.
- The program link points to the [official Youth Overseas Dream Fund website](https://twpathfinder.yda.gov.tw/).
- The public Instagram destination is [@roy_webtech](https://www.instagram.com/roy_webtech/). Instagram profile content could not be read reliably, so it was not used to infer additional biographical facts. The personal `roy._.chen234` account is not exposed on the site.

No medal, competition placing, school name, graduation date, employment history, or language proficiency was invented. Add those details when ready. Locally bundled DM Sans and Space Grotesk fonts include their SIL Open Font Licenses in `assets/fonts/`.
# ME
