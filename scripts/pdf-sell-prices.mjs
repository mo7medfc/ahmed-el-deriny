/**
 * Selling prices from "عملاء مطابع احمد الدرينى.pdf" (sell only — no cost).
 * Keys: `{CategoryId}_{productId}` matching catalog + seed docIds.
 * Values: sellingPrice (EGP). For sqm categories this is per meter/sqm as in the PDF.
 */
export const PDF_SELL_PRICES = {
  // Outdoor — يافطة الأوت دور (السعر بالمتر) page 3
  "Outdoor_banner-280g": 55,
  "Outdoor_banner-380g": 65,
  "Outdoor_banner-coated-400g": 130,
  "Outdoor_reflective-banner": 350,
  "Outdoor_white-vinyl": 95,
  "Outdoor_transparent-vinyl": 110,
  "Outdoor_frosted-vinyl-printed": 280,
  "Outdoor_frosted-vinyl-blank": 220,
  "Outdoor_reflective-vinyl": 450,
  "Outdoor_flex": 120,
  "Outdoor_flex-coated": 220,
  "Outdoor_see-through": 130,
  "Outdoor_glossy": 70,
  "Outdoor_lamination-only": 70,
  "Outdoor_glitter": 160,
  "Outdoor_election-banner-light": 65,

  // Indoor — يافطة الإندور (السعر بالمتر) page 6
  "Indoor_banner-380g": 135,
  "Indoor_glossy": 280,
  "Indoor_white-vinyl": 180,
  "Indoor_transparent-vinyl": 165,
  "Indoor_reflective-banner": 350,
  "Indoor_frosted-vinyl-blank": 240,
  "Indoor_frosted-vinyl-printed": 300,
  "Indoor_reflective-vinyl": 450,
  "Indoor_flex": 160,
  "Indoor_flex-coated": 240,
  "Indoor_see-through": 150,
  "Indoor_glitter": 290,
  "Indoor_lamination-only": 90,
  "Indoor_cutter-plotter": 130,
  "Indoor_print-and-cut": 200,

  // Stands — رول أب / أكس / بوب أب pages 4–5
  "Stands_roll-up-80-200-banner": 750,
  "Stands_roll-up-85-200-banner": 850,
  "Stands_roll-up-100-200-banner": 1050,
  "Stands_roll-up-120-200-banner": 1350,
  "Stands_roll-up-150-200-banner": 1550,
  "Stands_roll-up-80-200-glossy": 1150,
  "Stands_roll-up-85-200-glossy": 1230,
  "Stands_roll-up-100-200-glossy": 1350,
  "Stands_roll-up-120-200-glossy": 1700,
  "Stands_roll-up-150-200-glossy": 1900,
  "Stands_x-banner-60-160-banner": 800,
  "Stands_x-banner-80-180-banner": 900,
  "Stands_x-banner-60-160-glossy": 950,
  "Stands_x-banner-80-180-glossy": 1050,
  "Stands_pop-up-2x3-straight": 10000,
  "Stands_pop-up-2x3-curve": 10100,
  "Stands_pop-up-3x3-straight": 10900,
  "Stands_pop-up-3x3-curve": 11200,
  "Stands_pop-up-3x4-straight": 12200,
  "Stands_pop-up-3x4-curve": 12400,
  "Stands_pop-up-3x5-straight": 13200,
  "Stands_pop-up-3x5-curve": 13400,
  "Stands_pop-up-counter": 7200,
  "Stands_pop-up-promotion-table": 5800,

  // DTF — يبدأ من page 2
  DTF_config: 110,

  // Stamps — يبدأ من page 30
  Stamps_config: 140,

  // Sublimation gifts — pages 31/33
  SublimationGift_mug_white_printed: 125,
  SublimationGift_mug_colored_printed: 155,
  SublimationGift_mug_magic: 150,
  SublimationGift_coaster_wood: 45,
  SublimationGift_cap: 95,
  SublimationGift_medallion_wood_4x6_single: 38,
  SublimationGift_medallion_wood_4x6_double: 50,
  SublimationGift_mouse_pad: 70,
  SublimationGift_puzzle_small: 100,
  SublimationGift_puzzle_large: 115,
  SublimationGift_sublimation_paper: 40,
  SublimationGift_single_press: 25,
  SublimationGift_car_sun_visor: 80,

  // Promotional gifts — page 31
  promotional_gifts_enamel_name_tag: 45,
  promotional_gifts_gold_silver_name_tag_pin: 45,
  promotional_gifts_gold_silver_name_tag_magnet: 45,
  promotional_gifts_acrylic_medal_custom_shapes: 40,
  promotional_gifts_wooden_medal_custom_shapes: 38,
  promotional_gifts_acrylic_coaster_velvet_back: 55,
  promotional_gifts_acrylic_coaster_double_layer: 62,
  promotional_gifts_wooden_coaster_laser_engraved: 45,
  promotional_gifts_acrylic_stand_a5: 120,
  promotional_gifts_acrylic_stand_a4: 310,
  promotional_gifts_balloon_min_500: 8.5,
  promotional_gifts_wristbands: 28,
  promotional_gifts_swimming_pool_wristbands: 11,

  // Safety — page 32
  safety_printing_worker_vest: 190,
  safety_printing_engineer_vest: 260,
  safety_printing_safety_helmet: 210,
  safety_printing_vip_helmet: 340,

  // Flags — page 34 (if seeded later)
  "Flag_flag_2.5_feather": 2000,

  // Service placeholders — "from" prices
  dafater_config: 750,
  notebooks_invoices_config: 750,
  notebooks_books_booklets_config: 100,
};

/** Sqm outdoor/indoor use pricePerSquareMeter; others use sellingPrice */
export const SQM_CATEGORIES = new Set(["Outdoor", "Indoor"]);
