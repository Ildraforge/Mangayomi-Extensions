
# Mangayomi Extensions

Community-maintained JavaScript extensions for [Mangayomi](https://github.com/kodjodevf/mangayomi), focused on Spanish-language manga, manhwa, manhua, webcomics, and anime.

> **Disclaimer:** This is an unofficial community project. It is not affiliated with Mangayomi or any of the content providers supported by these extensions.

## Available Extensions

| Extension | Type | Language | Version | Status |
|---|---|---|---|---|
| [ManhwaWeb](https://manhwaweb.com) | Manga | Spanish (`es`) | `0.1.4` | Functional |
| [WEBTOON Español](https://www.webtoons.com/es) | Manga | Spanish (`es`) | `0.3.1` | Experimental |
| [Olympus Scans](https://olympusxyz.com) | Manga | Spanish (`es`) | `0.1.4` | Experimental |
| [JKAnime](https://jkanime.net) | Anime | Spanish (`es`) | `0.1.0` | Experimental / Untested in-app |

All four extensions are listed in this repository's `index.json`.

## Installation

1. Install Mangayomi on your device.
2. Open the extension repository settings.
3. Add the following repository URL:

   ```text
   https://raw.githubusercontent.com/Ildraforge/Mangayomi-Extensions/main/index.json
   ```

4. Refresh the extension list.
5. Find and install your preferred extension.
6. Open manga extensions from the manga browsing section or anime extensions from the anime browsing section.

**Note:** ManhwaWeb contains adult content. Enable NSFW / 18+ extensions in Mangayomi's settings if you want to use that source.

## Manga Extensions

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

**Version:** `0.3.1`  
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

Version `0.3.1` temporarily limits episode extraction to the first page of a series to help diagnose this issue.

The episode list and chapter reading functionality should not be considered functional until further testing is completed.

#### Limitations

- The current catalog implementation focuses on the Fantasy genre.
- Full catalog coverage and genre browsing are not yet implemented.
- Paid, locked, and app-exclusive episodes are not supported.
- Website changes may affect catalog, metadata, episode, and image extraction.
- This extension does not bypass WEBTOON access restrictions.

### Olympus Scans

**Version:** `0.1.4`  
**Language:** Spanish (`es`)  
**Status:** Experimental

A JavaScript extension integrating the Olympus Scans catalog into Mangayomi.

#### Implemented Features

- Browse series from the Olympus Scans catalog.
- Search for series by title.
- Display series information and cover images.
- Retrieve chapter lists.
- Extract chapter images for reading.
- Access the source website's available catalog data.

#### Limitations

- Functionality depends on the source website and its API.
- Changes to the website may affect search, chapter extraction, or image loading.
- Compatibility and reading behavior should be verified on each supported platform.

## Anime Extensions

### JKAnime

**Version:** `0.1.0`  
**Language:** Spanish (`es`)  
**Status:** Experimental / Awaiting in-app testing

A JavaScript anime extension for Mangayomi that integrates the JKAnime catalog and attempts to extract playable HLS streams.

#### Implemented Features

- Browse a selection of anime from the JKAnime homepage.
- Display recently updated anime.
- Search for anime by title.
- Extract anime titles, covers, and basic metadata.
- Request episode lists through JKAnime's AJAX API.
- Support multi-page episode retrieval for long-running series.
- Extract HLS (`.m3u8`) streaming links through the Magi player.

#### Development Status

**Verified outside Mangayomi:**

- JKAnime homepage and anime detail pages are accessible.
- The search endpoint returns anime results.
- The episode AJAX endpoint returns episode data when supplied with the appropriate session and CSRF information.
- The Magi player exposes HLS streaming links.
- A sample HLS playlist and video segment were accessible during testing.
- The JavaScript file passes `node --check`.

**Not yet verified:**

- Extension installation and recognition inside Mangayomi.
- Anime catalog and search rendering inside Mangayomi.
- Complete episode list loading through Mangayomi's HTTP client.
- HLS playback using Mangayomi's video player.

#### Known Limitations

- Episode retrieval may require additional session cookie handling.
- The homepage catalog is limited and does not represent the complete JKAnime library.
- The popular and latest sections currently share the same initial catalog implementation.
- Streaming URLs are temporary and must be extracted again when playback starts.
- Video availability depends on the source's external streaming providers.
- Website changes may break episode retrieval or video extraction.

**Important:** JKAnime `0.1.0` is an initial experimental implementation, not a confirmed working anime source.

## Compatibility

| Property | Value |
|---|---|
| Application | Mangayomi |
| Extension language | JavaScript |
| Catalog language | Spanish (`es`) |
| Manga sources | 3 |
| Anime sources | 1 |
| ManhwaWeb | `0.1.4` |
| WEBTOON Español | `0.3.1` |
| Olympus Scans | `0.1.4` |
| JKAnime | `0.1.0` |

ManhwaWeb and WEBTOON Español have been tested on Mangayomi 0.9.8 for Android.

Compatibility testing for Olympus Scans and JKAnime is not fully documented here.

Functionality may vary depending on the Mangayomi version, device platform, and changes to third-party websites.

## Repository Structure

```text
Mangayomi-Extensions/
├── README.md
├── repo.json
├── index.json
└── javascript/
    ├── manga/
    │   └── src/
    │       └── es/
    │           ├── manhwaweb.js
    │           ├── webtoon.js
    │           └── olympus.js
    └── anime/
        └── src/
            └── es/
                └── jkanime.js
```

The root `index.json` lists published extensions. Each extension has its own source identifier, version, and JavaScript implementation.

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

For WEBTOON Español, chapter listing and reading issues are particularly useful during experimental development.

For JKAnime, reports about episode loading, missing video sources, and HLS playback are especially helpful.

## Disclaimer

These extensions are independent integrations with third-party websites.

This repository does not host manga chapters, anime episodes, streaming videos, or copyrighted media.

All titles, artwork, images, logos, and trademarks belong to their respective owners.

Users are responsible for complying with applicable laws and the terms of service of the websites they access.

These extensions do not bypass paid access, DRM, or other content access restrictions.

## Credits

- [Mangayomi](https://github.com/kodjodevf/mangayomi) — Open-source manga and anime reader.
- [ManhwaWeb](https://manhwaweb.com) — Manga and manhwa content website.
- [WEBTOON](https://www.webtoons.com/es) — WEBTOON publishing platform.
- [Olympus Scans](https://olympusxyz.com) — Manga and manhwa content website.
- [JKAnime](https://jkanime.net) — Anime catalog and streaming website.
```
