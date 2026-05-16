import { PrismaClient } from '@prisma/client';

// Vercel's /tmp is empty on every cold start, so we create the table if missing.
// Using $extends makes this transparent — no changes needed in API routes.
const CREATE_LEAD_TABLE = `
  CREATE TABLE IF NOT EXISTS "Lead" (
    "id"           TEXT     NOT NULL PRIMARY KEY,
    "businessName" TEXT     NOT NULL,
    "category"     TEXT     NOT NULL,
    "city"         TEXT     NOT NULL,
    "address"      TEXT,
    "phone"        TEXT,
    "website"      TEXT,
    "rating"       REAL,
    "reviewCount"  INTEGER,
    "status"       TEXT     NOT NULL DEFAULT 'new',
    "notes"        TEXT,
    "pitchEmail"   TEXT,
    "createdAt"    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt"    DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`;

type ExtendedPrisma = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrisma;
  initPromise: Promise<void> | null;
};

function createClient() {
  const base = new PrismaClient();

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // One-shot init per Lambda instance; concurrent requests share the same promise
          if (!globalForPrisma.initPromise) {
            globalForPrisma.initPromise = base
              .$executeRawUnsafe(CREATE_LEAD_TABLE)
              .then(() => void 0);
          }
          await globalForPrisma.initPromise;
          return query(args);
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
