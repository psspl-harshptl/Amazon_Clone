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

// Maps a substring of the broken Amazon CDN filename to a local image path
const URL_MAP = [
  { match: '61CGHv6kmWL', local: '/images/products/headphones.png' },  // headphones / headset / tablet
  { match: '61mpMH5TCtL', local: '/images/products/deskmat.png'    },  // gaming mouse
  { match: '71vFKBpKakL', local: '/images/products/deskmat.png'    },  // laptop / camera / keyboard
  { match: '61LTuGZTVwL', local: '/images/products/deskmat.png'    },  // gaming monitor
  { match: '71Y8T1L2BLL', local: '/images/products/cosmetics.png'  },  // scotch-brite scrub pads
  { match: '61N+V3oT0DL', local: '/images/products/cosmetics.png'  },  // gala brush
  { match: '71k+V-W8GBL', local: '/images/products/cosmetics.png'  },  // gala steel scrubber
  { match: '61m+V3oT0DL', local: '/images/products/cosmetics.png'  },  // dish brush
  // catch-all: any remaining m.media-amazon.com URL
  { match: 'm.media-amazon.com', local: '/images/products/placeholder.png' },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.\n');

    let total = 0;

    // Fix Products.imageUrl
    for (const { match, local } of URL_MAP) {
      const [, meta] = await sequelize.query(
        `UPDATE "Products" SET "imageUrl" = :local, "updatedAt" = NOW()
         WHERE "imageUrl" LIKE :pattern AND "imageUrl" NOT LIKE '/images/%'`,
        { replacements: { local, pattern: `%${match}%` }, type: Sequelize.QueryTypes.UPDATE }
      );
      const count = meta?.rowCount ?? 0;
      if (count > 0) { console.log(`  [Products] Updated ${count}: ...${match}... → ${local}`); total += count; }
    }

    // Fix ProductImages.url (gallery thumbnails)
    for (const { match, local } of URL_MAP) {
      const [, meta] = await sequelize.query(
        `UPDATE "ProductImages" SET url = :local, "updatedAt" = NOW()
         WHERE url LIKE :pattern AND url NOT LIKE '/images/%'`,
        { replacements: { local, pattern: `%${match}%` }, type: Sequelize.QueryTypes.UPDATE }
      );
      const count = meta?.rowCount ?? 0;
      if (count > 0) { console.log(`  [ProductImages] Updated ${count}: ...${match}... → ${local}`); total += count; }
    }

    console.log(`\nDone. ${total} image URL(s) updated.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
