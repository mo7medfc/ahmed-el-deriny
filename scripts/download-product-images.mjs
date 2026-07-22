/**
 * Download verified product/category images (Wikimedia Commons + curated Unsplash).
 * Run: npm run images:download
 */
import { mkdirSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "products");

const UA = "AhmedDerinyBot/1.0 (admin@ahmedderiny.com; printing shop website)";

/** Direct Wikimedia / verified URLs — each maps to a real printing product */
const DOWNLOADS = {
  "roll-up.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/8/87/Roll_Up_before_installation.jpg",
  "rollup-100x200.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stand_Banner_-_PXL_20241117_060739782.MP.jpg/960px-Stand_Banner_-_PXL_20241117_060739782.MP.jpg",
  "x-banner.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/HK_MTR_%E5%A4%A7%E5%9F%94%E5%A2%9F%E7%AB%99_Tai_Po_Market_Station_shop_June_2018_IX2_Hung_Fook_Tong_stand_up_banner_n_visitors.jpg/960px-HK_MTR_%E5%A4%A7%E5%9F%94%E5%A2%9F%E7%AB%99_Tai_Po_Market_Station_shop_June_2018_IX2_Hung_Fook_Tong_stand_up_banner_n_visitors.jpg",
  "pop-up.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/PTA_Display_Booth_at_Builders_Show_-_DPLA_-_e84385e8d8b3b2d176e69cbee9186b49.jpg/960px-PTA_Display_Booth_at_Builders_Show_-_DPLA_-_e84385e8d8b3b2d176e69cbee9186b49.jpg",
  "stamps.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Czech_office_timestamp.jpg/960px-Czech_office_timestamp.jpg",
  "self-ink-stamp.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Czech_office_time_stamp_with_inkpillow.jpg/960px-Czech_office_time_stamp_with_inkpillow.jpg",
  "rubber-stamp.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Czech_office_timestamp.jpg/960px-Czech_office_timestamp.jpg",
  "notebooks.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Pen-writing-notes-studying.jpg/960px-Pen-writing-notes-studying.jpg",
  "safety-vest.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Warnweste_gelb.jpg/960px-Warnweste_gelb.jpg",
  "dtf-tshirt.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/A_graphic_designer_transferring_an_impression_on_to_a_shirt_with_heat_press.jpg/960px-A_graphic_designer_transferring_an_impression_on_to_a_shirt_with_heat_press.jpg",
  "uv-printing.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Canon_imagePROGRAF_TX-5310_LARGE_FORMAT_PRINTER.jpg/960px-Canon_imagePROGRAF_TX-5310_LARGE_FORMAT_PRINTER.jpg",
  "default-printing.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Plotter_A0_nouvelle_g%C3%A9n%C3%A9ration_%282020%29.jpg/960px-Plotter_A0_nouvelle_g%C3%A9n%C3%A9ration_%282020%29.jpg",
  "lamination.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
  "envelopes.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Sprechender_Brief_--_2015_--_6004.jpg/960px-Sprechender_Brief_--_2015_--_6004.jpg",
  "business-cards.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Business_cards_of_high-ranking_public_officials_in_the_tourism_sector.jpg/960px-Business_cards_of_high-ranking_public_officials_in_the_tourism_sector.jpg",
  "promotional-gifts.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Bag%2C_shopping_%28AM_2015.37.2-2%29.jpg/960px-Bag%2C_shopping_%28AM_2015.37.2-2%29.jpg",
  "fabric-bag.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/A_cotton_bag_with_runes_-_Baumwolltasche_mit_Runen.jpg/960px-A_cotton_bag_with_runes_-_Baumwolltasche_mit_Runen.jpg",
  "paper-bags.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Bag%2C_shopping_%28AM_2015.37.2-8%29.jpg/960px-Bag%2C_shopping_%28AM_2015.37.2-8%29.jpg",
  "kraft-bags.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Bag%2C_shopping_%28AM_2015.37.2-4%29.jpg/960px-Bag%2C_shopping_%28AM_2015.37.2-4%29.jpg",
  // Curated Unsplash — verified outdoor banner + vinyl rolls in print shop
  // outdoor / flex banner — fallback alias from vinyl-banner if download fails
  "outdoor-banner-src.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Plotter_A0_nouvelle_g%C3%A9n%C3%A9ration_%282020%29.jpg/1280px-Plotter_A0_nouvelle_g%C3%A9n%C3%A9ration_%282020%29.jpg",
  "vinyl-banner.jpg":
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
};

const ALIASES = [
  ["outdoor-banner-src.jpg", "outdoor-banner.jpg"],
  ["outdoor-banner-src.jpg", "flex-banner.jpg"],
  ["outdoor-banner-src.jpg", "banners.jpg"],
  ["vinyl-banner.jpg", "vinyl-flex.jpg"],
  ["rollup-100x200.jpg", "roll-ups.jpg"],
  ["lamination.jpg", "indoor-print.jpg"],
  ["lamination.jpg", "posters.jpg"],
  ["lamination.jpg", "tableaux.jpg"],
  ["business-cards.jpg", "brochures.jpg"],
  ["business-cards.jpg", "flyers.jpg"],
  ["notebooks.jpg", "catalogs.jpg"],
  ["roll-up.jpg", "rollup-85x200.jpg"],
  ["dtf-tshirt.jpg", "tshirt.jpg"],
  ["safety-vest.jpg", "safety-printing.jpg"],
  ["business-cards.jpg", "business-card.jpg"],
  ["promotional-gifts.jpg", "sublimation-gifts.jpg"],
  ["uv-printing.jpg", "offset-printing.jpg"],
  ["stamps.jpg", "rosary-cards.jpg"],
];

mkdirSync(OUT_DIR, { recursive: true });

async function download(name, url) {
  await new Promise((r) => setTimeout(r, 1200));
  const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error("file too small");
  writeFileSync(join(OUT_DIR, name), buf);
  return buf.length;
}

let ok = 0;
for (const [file, url] of Object.entries(DOWNLOADS)) {
  try {
    const size = await download(file, url);
    console.log(`  ✓ ${file} (${Math.round(size / 1024)}KB)`);
    ok++;
  } catch (e) {
    console.warn(`  ✗ ${file}: ${e.message}`);
  }
}

for (const [src, dst] of ALIASES) {
  try {
    copyFileSync(join(OUT_DIR, src), join(OUT_DIR, dst));
    console.log(`  → ${dst} (from ${src})`);
  } catch {
    /* source may have failed */
  }
}

console.log(`\nDownloaded ${ok}/${Object.keys(DOWNLOADS).length} images → ${OUT_DIR}`);
