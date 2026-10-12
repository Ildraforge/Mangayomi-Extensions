
# Mangayomi Extensions

Community-maintained JavaScript extensions for [Mangayomi](https://github.com/kodjodevf/mangayomi), focused on Spanish-language manga, manhwa, manhua, and webcomics.

> **Disclaimer:** This is an unofficial community project. It is not affiliated with Mangayomi, ManhwaWeb, WEBTOON, or their respective owners.

## Available Extensions

| Extension | Language | Version | Status |
|---|---|---|---|
| [ManhwaWeb](https://manhwaweb.com) | Spanish (`es`) | `0.1.4` | Functional |
| [WEBTOON Español](https://www.webtoons.com/es) | Spanish (`es`) | `0.1.1` | Experimental |

Both extensions are listed in this repository's `index.json` and can be installed through Mangayomi.

## Installation

1. Install Mangayomi on your device.
2. Open the extension repository settings.
3. Add the following repository URL:

   ```text
   https://raw.githubusercontent.com/Ildraforge/Mangayomi-Extensions/main/index.json
   ```

4. Refresh the extension list.
5. Find and install your preferred extension.
6. Open the extension from Mangayomi's browse section.

**Note:** ManhwaWeb contains adult content. Enable NSFW / 18+ extensions in Mangayomi's settings if you want to use that source.

## Extensions

### ManhwaWeb

**Version:** `0.1.4`  
**Language:** Spanish (`es`)  
**Status:** Functional  
**Content rating:** NSFW / 18+

A JavaScript extension that integrates the Spanish-language ManhwaWeb catalog into Mangayomi.

#### Features

- Browse titles with cover images.
- Search manga, manhwa, manhua, and other supported content.
- View descriptions, authors, publication status, and chapter lists.
- Read chapters directly in Mangayomi.
- Browse popular titles and recent additions.
- Filter by:
  - Content type (Manhwa, Manga, Manhua, Doujinshi, Novel, One-shot).
  - Demographic (Seinen, Shonen, Josei, Shojo).
  - Publication status.
  - Adult content.
  - Genre, with up to four simultaneously selected genres.
- Sort by title, creation date, popularity, or chapter count, in ascending or descending order.

#### Tested Functionality

The catalog, search, filters, chapter lists, and chapter reading have been tested on Mangayomi 0.9.8 for Android.

#### Known Limitations

- Requires an internet connection.
- Availability depends on the ManhwaWeb website and its API.
- Website or API changes may temporarily break the extension.
- Genre filtering follows the source website's limit of four selected genres.

### WEBTOON Español

**Version:** `0.1.1`  
**Language:** Spanish (`es`)  
**Status:** Experimental / Under development

A JavaScript extension intended to provide access to publicly available Spanish-language WEBTOON series through Mangayomi.

#### Current Functionality

- Browse a catalog of Spanish-language WEBTOON series.
- Display series covers and titles.
- Search for series by title.
- Display series details, including descriptions, authors, and genres.
- Extract episode information from WEBTOON pages (currently under investigation).
- Extract publicly accessible episode images (implementation available; Android reading not yet verified).

#### Current Development Status

The extension has been tested on Mangayomi 0.9.8 for Android.

**Confirmed working:**

- Extension installation and recognition.
- Catalog display.
- Series details, including title, cover, description, authors, and genre.

**Implemented but not fully verified:**

- Search functionality.
- Episode image loading.

**Known issue:**

- Series details currently display `0 chapters` despite publicly available episodes being present on the source website.

Version `0.1.1` temporarily limits episode extraction to the first page of a series to help diagnose this issue.

The episode list and chapter reading functionality should not be considered functional until further testing is completed.

#### Limitations

- The current catalog implementation focuses on the Fantasy genre.
- Full catalog coverage and genre browsing are not yet implemented.
- Paid, locked, and app-exclusive episodes are not supported.
- Website changes may affect catalog, metadata, episode, and image extraction.
- This extension does not bypass WEBTOON access restrictions.

## Compatibility

| Property | Value |
|---|---|
| Application | Mangayomi |
| Tested version | `0.9.8` |
| Tested platform | Android |
| Extension language | JavaScript |
| Catalog language | Spanish (`es`) |
| ManhwaWeb version | `0.1.4` |
| WEBTOON Español version | `0.1.1` |

Compatibility and functionality may vary depending on the Mangayomi version and changes to the supported websites.

## Repository Structure

```text
Mangayomi-Extensions/
├── README.md
├── repo.json
├── index.json
└── javascript/
    └── manga/
        └── src/
            └── es/
                ├── manhwaweb.js
                └── webtoon.js
```

The root `index.json` lists the published extensions. Each extension has its own source identifier, version, and JavaScript implementation.

## Updates

Updates are distributed through this GitHub repository.

To check for new versions:

1. Open Mangayomi.
2. Refresh the extension repository list.
3. Check whether an extension update is available.
4. Install the update if applicable.

Development versions may contain incomplete features or temporary diagnostic changes.

## Reporting Issues

If you encounter a problem, open a [GitHub issue](https://github.com/Ildraforge/Mangayomi-Extensions/issues).

Please include:

- Extension name and version.
- Mangayomi version.
- Device platform.
- Description of the problem.
- Steps to reproduce it.
- Screenshots or relevant error messages, if available.

For WEBTOON Español, chapter listing and reading issues are particularly useful during the experimental development phase.

## Disclaimer

These extensions are independent integrations with third-party websites.

This repository does not host manga chapters, WEBTOON episodes, or copyrighted comic images.

All titles, artwork, images, logos, and trademarks belong to their respective owners.

Users are responsible for complying with applicable laws and the terms of service of the websites they access.

## Credits

- [Mangayomi](https://github.com/kodjodevf/mangayomi) — Open-source manga and anime reader.
- [ManhwaWeb](https://manhwaweb.com) — Content website and catalog.
- [WEBTOON](https://www.webtoons.com/es) — WEBTOON publishing platform.
