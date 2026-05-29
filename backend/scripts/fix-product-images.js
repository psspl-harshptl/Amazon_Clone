'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// slug → correct local image
const SLUG_IMAGE_MAP = [
  { slug: 'oneplus-12r-iron-gray',           image: '/images/products/smartphone.jpg' },
  { slug: 'apple-iphone-15-blue',            image: '/images/products/smartphone.jpg' },
  { slug: 'mens-regular-fit-tshirt',         image: '/images/products/tshirt.jpg' },
  { slug: 'premium-over-ear-headphones',     image: '/images/products/headphones.png' },
  { slug: 'ultra-thin-laptop',               image: '/images/products/laptop.jpg' },
  { slug: 'mirrorless-camera',               image: '/images/products/camera.jpg' },
  { slug: 'gaming-monitor-4k',               image: '/images/products/monitor.jpg' },
  { slug: 'professional-tablet',             image: '/images/products/tablet.jpg' },
  { slug: 'scotch-brite-scrub-pad-5',        image: '/images/products/cleaning.jpg' },
  { slug: 'gala-soft-brush',                 image: '/images/products/cleaning.jpg' },
  { slug: 'gala-steel-scrubber-6',           image: '/images/products/cleaning.jpg' },
  { slug: 'cello-kleeno-brush',              image: '/images/products/cleaning.jpg' },
  { slug: 'scotch-brite-gloves',             image: '/images/products/cleaning.jpg' },
  { slug: 'razer-blackshark-v2-pro',         image: '/images/products/headset.png' },
  { slug: 'logitech-g502-hero',              image: '/images/products/gaming-mouse.png' },
  { slug: 'corsair-k70-rgb',                 image: '/images/products/gaming-keyboard.png' },
  { slug: 'razer-deathadder-v2',             image: '/images/products/gaming-mouse.png' },
  { slug: 'logitech-g-pro-keyboard',         image: '/images/products/gaming-keyboard.png' },
  { slug: 'proflow-max-laptop-16',           image: '/images/products/laptop.jpg' },
  { slug: 'pedigree-adult-dry-dog-food',     image: '/images/products/dog-food.jpg' },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.\n');

    let total = 0;
    for (const { slug, image } of SLUG_IMAGE_MAP) {
      const [, meta] = await sequelize.query(
        `UPDATE "Products" SET "imageUrl" = :image, "updatedAt" = NOW() WHERE slug = :slug`,
        { replacements: { image, slug }, type: Sequelize.QueryTypes.UPDATE }
      );
      const count = meta?.rowCount ?? 0;
      if (count > 0) {
        console.log(`  [${count}] ${slug} → ${image}`);
        total += count;
      }
    }

    // Fix ProductImages table: update secondary images for headset
    await sequelize.query(
      `UPDATE "ProductImages" pi
       SET url = '/images/products/headset.png', "updatedAt" = NOW()
       FROM "Products" p
       WHERE pi."productId" = p.id AND p.slug = 'razer-blackshark-v2-pro'
         AND pi."isMain" = false AND pi.url NOT LIKE '/images/products/headset%'`
    );

    console.log(`\nDone. ${total} product(s) updated.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
