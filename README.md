# ManhwaWeb for Mangayomi

A community-made JavaScript manga extension for **Mangayomi**, providing access to the Spanish-language catalog of [ManhwaWeb](https://manhwaweb.com).

**Current version:** `0.1.4`  
**Language:** Spanish (`es`)  
**Content rating:** NSFW / 18+

> **Disclaimer:** This is an unofficial, community-maintained extension. It is not affiliated with Mangayomi or ManhwaWeb.

## Features

- Browse the ManhwaWeb catalog with titles and cover images.
- Search manga and manhwa by title.
- View descriptions, authors, publication status, and chapter lists.
- Read chapters directly in Mangayomi.
- Browse popular titles and recent additions.
- Filter by:
  - Content type (Manhwa, Manga, Manhua, Doujinshi, Novel, One-shot)
  - Demographic (Seinen, Shonen, Josei, Shojo)
  - Publication status
  - Adult content
  - Genre (27 available, up to 4 simultaneously)
- Sort by title, creation date, popularity, or chapter count, in ascending or descending order.

## Installation

1. Install **Mangayomi** on your Android device.
2. Open Mangayomi and navigate to the extensions/repositories settings.
3. Add the following repository URL:

   ```
   https://raw.githubusercontent.com/Ildraforge/Mangayomi-ManhwaWeb/main/index.json
   ```

4. Refresh the repository or extension list.
5. Enable **NSFW / 18+ extensions** in Mangayomi's settings, if necessary.
6. Find **ManhwaWeb** in the manga extensions list and install it.
7. Open the extension to browse, search, and read.

## Compatibility

| Property | Value |
|---|---|
| Platform tested | Android |
| Mangayomi version tested | 0.9.8 |
| Extension language | JavaScript |
| Catalog language | Spanish |
| Extension version | 0.1.4 |
| NSFW content | Yes |

## Repository Structure

```text
Mangayomi-ManhwaWeb/
├── README.md
├── repo.json
├── index.json
└── javascript/
    └── manga/
        └── src/
            └── es/
                └── manhwaweb.js
```

## Updates

Updates are published through this GitHub repository. Refresh the extension list in Mangayomi to check for new versions.

## Known Limitations

- Requires an internet connection.
- Availability depends on the ManhwaWeb website and its API.
- Website or API changes may temporarily break the extension.
- Genre filtering follows the source website's limit of four selected genres.

## Version History

### v0.1.4
- Added grouped genre filters.
- Added genre-based search support.
- Included catalog filters and sorting options.
- Confirmed chapter browsing and reading functionality.

## Support

If you encounter a bug, open an [issue on GitHub](https://github.com/Ildraforge/Mangayomi-ManhwaWeb/issues) with a description of the problem, your Mangayomi version, and steps to reproduce it.

## Credits

- [Mangayomi](https://github.com/kodjodevf/mangayomi) — Open-source manga and anime reader.
- [ManhwaWeb](https://manhwaweb.com) — Original content catalog and website.

This project is an independent integration. All content, titles, images, and trademarks belong to their respective owners.
